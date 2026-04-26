using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Boot.Tester;

public class DeleteThoughtTester : IClassFixture<SeededAppContainer<DeleteThoughtTester>>
{
    SeededAppContainer<DeleteThoughtTester> fixture;

    public DeleteThoughtTester(SeededAppContainer<DeleteThoughtTester> fixture)
    {
        this.fixture = fixture;
    }

    private static string LinkContent(Guid targetId) => $"[{targetId}][linked thought]";

    // Scenario 1: cascade deletes thought references and notifications
    [Fact]
    public async Task DeleteCascadesReferencesAndNotifications()
    {
        var logic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();
        var notifications = fixture.Services.GetRequiredService<INotificationDataContract>();

        var notifsBefore = (await notifications.GetUserNotifications(fixture.UserId1)).Payload!.Count;

        var postResult = await logic.PostThought(fixture.UserId2, "cascade test", LinkContent(fixture.ThoughtId1), ThoughtShape.Circle);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);
        var replyId = postResult.Payload;

        var notifsAfterPost = (await notifications.GetUserNotifications(fixture.UserId1)).Payload!;
        Assert.Equal(notifsBefore + 1, notifsAfterPost.Count);
        Assert.Contains(notifsAfterPost, n => n.Thought?.Id == replyId);

        var deleteResult = await logic.DeleteThought(replyId);
        Assert.True(deleteResult.IsSuccess, deleteResult.Error?.Message);

        // Thought is gone
        var fetchDeleted = await data.GetThoughtById(replyId);
        Assert.False(fetchDeleted.IsSuccess);

        // Notification is cascade-deleted
        var notifsAfterDelete = (await notifications.GetUserNotifications(fixture.UserId1)).Payload!;
        Assert.Equal(notifsBefore, notifsAfterDelete.Count);

        // ThoughtReference is cascade-deleted
        var target = await data.GetThoughtById(fixture.ThoughtId1);
        Assert.DoesNotContain(target.Payload!.Replies, r => r.Id == replyId);
    }

    // Scenario 2 (happy path): delete debumps the linked thought
    [Fact]
    public async Task DeleteDebumpsLinkedThought()
    {
        var logic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();

        var sizeBefore = (await data.GetThoughtById(fixture.ThoughtId2)).Payload!.Size;

        var postResult = await logic.PostThought(fixture.UserId1, "debump test", LinkContent(fixture.ThoughtId2), ThoughtShape.Circle);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var sizeAfterPost = (await data.GetThoughtById(fixture.ThoughtId2)).Payload!.Size;
        Assert.Equal(sizeBefore + 1, sizeAfterPost);

        var deleteResult = await logic.DeleteThought(postResult.Payload);
        Assert.True(deleteResult.IsSuccess, deleteResult.Error?.Message);

        var sizeAfterDelete = (await data.GetThoughtById(fixture.ThoughtId2)).Payload!.Size;
        Assert.Equal(sizeBefore, sizeAfterDelete);
    }

    // Scenario 2i: self-linked thought was never bumped — delete must not debump
    [Fact]
    public async Task DeleteDoesNotDebumpSelfLinkedThought()
    {
        var logic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();

        var sizeBefore = (await data.GetThoughtById(fixture.ThoughtId3)).Payload!.Size;

        // User3 links to their own thought
        var postResult = await logic.PostThought(fixture.UserId3, "self link", LinkContent(fixture.ThoughtId3), ThoughtShape.Circle);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var sizeAfterPost = (await data.GetThoughtById(fixture.ThoughtId3)).Payload!.Size;
        Assert.Equal(sizeBefore, sizeAfterPost); // self-link never bumps

        await logic.DeleteThought(postResult.Payload);

        var sizeAfterDelete = (await data.GetThoughtById(fixture.ThoughtId3)).Payload!.Size;
        Assert.Equal(sizeBefore, sizeAfterDelete); // must not debump either
    }

    // Scenario 2ii: user has another reply to the same thought — deleting one must not debump
    [Fact]
    public async Task DeleteDoesNotDebumpWhenUserHasOtherReply()
    {
        var logic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();

        var sizeBefore = (await data.GetThoughtById(fixture.ThoughtId1)).Payload!.Size;

        var reply1 = await logic.PostThought(fixture.UserId2, "first reply", LinkContent(fixture.ThoughtId1), ThoughtShape.Circle);
        Assert.True(reply1.IsSuccess, reply1.Error?.Message);

        var sizeAfterFirst = (await data.GetThoughtById(fixture.ThoughtId1)).Payload!.Size;
        Assert.Equal(sizeBefore + 1, sizeAfterFirst); // bumped once

        var reply2 = await logic.PostThought(fixture.UserId2, "second reply", LinkContent(fixture.ThoughtId1), ThoughtShape.Circle);
        Assert.True(reply2.IsSuccess, reply2.Error?.Message);

        var sizeAfterSecond = (await data.GetThoughtById(fixture.ThoughtId1)).Payload!.Size;
        Assert.Equal(sizeBefore + 1, sizeAfterSecond); // no additional bump

        // Deleting first reply — second still exists, so must not debump
        await logic.DeleteThought(reply1.Payload);

        var sizeAfterDelete = (await data.GetThoughtById(fixture.ThoughtId1)).Payload!.Size;
        Assert.Equal(sizeBefore + 1, sizeAfterDelete); // still bumped by second reply
    }
}
