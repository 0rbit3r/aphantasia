using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Boot.Tester;

public class BumpTester : IClassFixture<SeededAppContainer<BumpTester>>
{
    SeededAppContainer<BumpTester> fixture;

    public BumpTester(SeededAppContainer<BumpTester> fixture)
    {
        this.fixture = fixture;
    }

    private static string LinkContent(Guid targetId) => $"[{targetId}][linked thought]";

    // Scenario 3: second reply by the same user to the same thought does not bump again
    [Fact]
    public async Task SecondReplyToSameThoughtDoesNotBump()
    {
        var logic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();

        var sizeBefore = (await data.GetThoughtById(fixture.ThoughtId1)).Payload!.Size;

        var first = await logic.PostThought(fixture.UserId2, "first reply", LinkContent(fixture.ThoughtId1), ThoughtShape.Circle);
        Assert.True(first.IsSuccess, first.Error?.Message);
        Assert.Equal(sizeBefore + 1, (await data.GetThoughtById(fixture.ThoughtId1)).Payload!.Size);

        var second = await logic.PostThought(fixture.UserId2, "second reply", LinkContent(fixture.ThoughtId1), ThoughtShape.Circle);
        Assert.True(second.IsSuccess, second.Error?.Message);
        Assert.Equal(sizeBefore + 1, (await data.GetThoughtById(fixture.ThoughtId1)).Payload!.Size); // unchanged
    }

    // Scenario 4: duplicate links in content create only one reference, one notification, and bump once
    [Fact]
    public async Task DuplicateLinksDeduplicates()
    {
        var logic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();
        var notifications = fixture.Services.GetRequiredService<INotificationDataContract>();

        var sizeBefore = (await data.GetThoughtById(fixture.ThoughtId2)).Payload!.Size;
        var repliesBefore = (await data.GetThoughtById(fixture.ThoughtId2)).Payload!.Replies.Count;
        var notifsBefore = (await notifications.GetUserNotifications(fixture.UserId2)).Payload!.Count;

        // Same ID appears twice in content
        var content = $"[{fixture.ThoughtId2}][first mention] [{fixture.ThoughtId2}][second mention]";
        var postResult = await logic.PostThought(fixture.UserId1, "dedup test", content, ThoughtShape.Circle);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var target = (await data.GetThoughtById(fixture.ThoughtId2)).Payload!;
        Assert.Equal(sizeBefore + 1, target.Size);                       // bumped exactly once
        Assert.Equal(repliesBefore + 1, target.Replies.Count);           // one reference, not two

        var notifsAfter = (await notifications.GetUserNotifications(fixture.UserId2)).Payload!;
        Assert.Equal(notifsBefore + 1, notifsAfter.Count);               // one notification, not two
    }

    // Scenario 5: linking to two thoughts by the same author sends that author only one notification
    [Fact]
    public async Task TwoLinksToSameAuthorSendOneNotification()
    {
        var logic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();
        var notifications = fixture.Services.GetRequiredService<INotificationDataContract>();

        // Create a second thought for User3 so we can link to two of their thoughts
        var secondUser3Thought = await data.InsertThought(fixture.UserId3, "user3 extra", "hello world", ThoughtShape.Circle);
        Assert.True(secondUser3Thought.IsSuccess);

        var notifsBefore = (await notifications.GetUserNotifications(fixture.UserId3)).Payload!.Count;

        var content = $"[{fixture.ThoughtId3}][first link] [{secondUser3Thought.Payload}][second link]";
        var postResult = await logic.PostThought(fixture.UserId1, "one notif test", content, ThoughtShape.Circle);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var notifsAfter = (await notifications.GetUserNotifications(fixture.UserId3)).Payload!;
        Assert.Equal(notifsBefore + 1, notifsAfter.Count); // one notification despite two links
    }
}
