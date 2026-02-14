using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Boot.Tester;

public class ThoughtTester : IClassFixture<SeededAppContainer<ThoughtTester>>
{
    SeededAppContainer<ThoughtTester> fixture;
    public ThoughtTester(SeededAppContainer<ThoughtTester> fixture)
    {
        this.fixture = fixture;
    }

    [Theory]
    [InlineData("testtt", "something about dogs", null)] // success

    [InlineData("", "asdfadsfassafsdafdsadsa", ErrorCode.BadRequest)] // content and title too short/long
    [InlineData("asdfsadfdasf", "", ErrorCode.BadRequest)]
    [InlineData("asdfsadfdasasdfsfdsfsdsdfdsfdsdsdsdsdsfsfsdfsdssfssd", "sdfdsfds", ErrorCode.BadRequest)]
    [InlineData("title", tooLongContent, ErrorCode.BadRequest)]

    [InlineData("title", "hello, [019c5448-1254-7282-8040-47be31969dbf][this] doesn't exist", ErrorCode.BadRequest)] // malformed thought link
    public async Task PostLoneThoughtSuccesfully(string title, string content, ErrorCode? expectedCode)
    {
        var thoughtContract = fixture.Services.GetRequiredService<IThoughtLogicContract>();

        var postResult = await thoughtContract.PostThought(fixture.UserId1, title, content, ThoughtShape.Circle);

        Assert.True(expectedCode is not null || postResult.IsSuccess, postResult.Error?.Message);
        Assert.Equal(expectedCode, postResult.Error?.Code);
    }


    [Fact]
    public async Task PostLinkedThoughtSuccesfully()
    {
        var thoughtRepo = fixture.Services.GetRequiredService<IThoughtDataContract>();

        var oldThought1 = await thoughtRepo.GetThoughtById(fixture.ThoughtId1);
        var oldThought2 = await thoughtRepo.GetThoughtById(fixture.ThoughtId2);
        var oldThought3 = await thoughtRepo.GetThoughtById(fixture.ThoughtId3);

        var thoughtContract = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var content = $"link one [{oldThought1.Payload?.Id}][this] link two [{oldThought2.Payload?.Id}][that]  [{oldThought3.Payload?.Id}][this]  badabam";
        var postResult = await thoughtContract.PostThought(fixture.UserId3, "test", content, ThoughtShape.Circle);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var newThought1 = await thoughtRepo.GetThoughtById(fixture.ThoughtId1);
        var newThought2 = await thoughtRepo.GetThoughtById(fixture.ThoughtId2);
        var newThought3 = await thoughtRepo.GetThoughtById(fixture.ThoughtId3);

        Assert.Equal(oldThought1.Payload?.Size + 1, newThought1.Payload?.Size);
        Assert.Equal(oldThought2.Payload?.Size + 1, newThought2.Payload?.Size);
        Assert.Equal(oldThought3.Payload?.Size, newThought3.Payload?.Size); // self reference doesn't bump

        Assert.Equal(oldThought1.Payload?.Replies.Count() + 1, newThought1.Payload?.Replies.Count());
        Assert.Equal(oldThought2.Payload?.Replies.Count() + 1, newThought2.Payload?.Replies.Count());
        Assert.Equal(oldThought3.Payload?.Replies.Count() + 1, newThought3.Payload?.Replies.Count());

        Assert.Contains(postResult.Payload, newThought1.Payload?.Replies?.Select(r => r.Id)?.ToList() ?? []);
        Assert.Contains(postResult.Payload, newThought2.Payload?.Replies?.Select(r => r.Id)?.ToList() ?? []);
        Assert.Contains(postResult.Payload, newThought3.Payload?.Replies?.Select(r => r.Id)?.ToList() ?? []);

        var insertedThoughtResult = await thoughtRepo.GetThoughtById(postResult.Payload);

        Assert.True(insertedThoughtResult.IsSuccess);
        Assert.Equal(3, insertedThoughtResult.Payload?.Links.Count());
    }
    private const string tooLongContent = 
@"blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah
";
}