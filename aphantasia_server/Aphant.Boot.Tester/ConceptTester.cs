using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
using Aphant.Core.Dto;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Boot.Tester;

public class ConceptTester : IClassFixture<SeededAppContainer<ConceptTester>>
{
    SeededAppContainer<ConceptTester> fixture;

    public ConceptTester(SeededAppContainer<ConceptTester> fixture)
    {
        this.fixture = fixture;
    }

    // tag param is what to look up; expectLinked = whether that concept should contain the new thought
    [Theory]
    [InlineData("hello _dogs are cool", "_dogs", true)]          // valid single-part tag
    [InlineData("not_concept here", "_concept", false)]          // underscore mid-word, no match
    [InlineData("not_a_concept here", "_a_concept", false)]      // underscore mid-word, no match
    [InlineData("this is _what_is important", "_what_is", true)] // valid two-part tag
    [InlineData("plain text no tags", "_plain", false)]          // no tags at all
    public async Task ConceptTagCreatedOnlyWhenLeadingUnderscore(string content, string tag, bool expectLinked)
    {
        var thoughtLogic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var conceptData = fixture.Services.GetRequiredService<IConceptDataContract>();

        var postResult = await thoughtLogic.PostThought(fixture.UserId1, "concept test", content, ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var conceptResult = await conceptData.GetConceptWithChildren(tag);
        var thoughtIds = conceptResult.Payload?.Thoughts.Select(t => t.Id).ToList() ?? [];

        Assert.Equal(expectLinked, thoughtIds.Contains(postResult.Payload));
    }

    [Fact]
    public async Task DuplicateConceptTagsLinkThoughtOnce()
    {
        var thoughtLogic = fixture.Services.GetRequiredService<IThoughtLogicContract>();
        var conceptData = fixture.Services.GetRequiredService<IConceptDataContract>();

        var postResult = await thoughtLogic.PostThought(fixture.UserId1, "dedup concept test", "_dogs and _dogs again", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var conceptResult = await conceptData.GetConceptWithChildren("_dogs");
        Assert.True(conceptResult.IsSuccess);

        var matchingThoughts = conceptResult.Payload!.Thoughts
            .Where(t => t.Id == postResult.Payload)
            .ToList();

        Assert.Single(matchingThoughts);
    }
}
