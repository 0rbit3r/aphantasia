using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Boot.Tester;

public class ConceptTester : IClassFixture<SeededAppContainer<ConceptTester>>
{
    SeededAppContainer<ConceptTester> fixture;

    public ConceptTester(SeededAppContainer<ConceptTester> fixture)
    {
        this.fixture = fixture;
    }

    private IThoughtLogicContract Logic => fixture.Services.GetRequiredService<IThoughtLogicContract>();
    private IConceptDataContract ConceptData => fixture.Services.GetRequiredService<IConceptDataContract>();

    private async Task<bool> ThoughtInConcept(Guid thoughtId, string tag)
    {
        var result = await ConceptData.GetConceptWithChildren(tag);
        return result.Payload?.Thoughts.Any(t => t.Id == thoughtId) ?? false;
    }

    private async Task<int> ThoughtCountInConcept(Guid thoughtId, string tag)
    {
        var result = await ConceptData.GetConceptWithChildren(tag);
        return result.Payload?.Thoughts.Count(t => t.Id == thoughtId) ?? 0;
    }

    // ── Basic boundary / anchor tests ──────────────────────────────────────────

    // tag param is what to look up; expectLinked = whether that concept should contain the new thought
    [Theory]
    [InlineData("hello _dogs are cool", "_dogs", true)]              // valid single-part tag
    [InlineData("not_concept here", "_concept", false)]              // preceded by letter → no match
    [InlineData("not_a_concept here", "_a_concept", false)]          // preceded by letter → no match
    [InlineData("this is _what_is important", "_what_is", true)]     // valid two-part tag
    [InlineData("plain text no tags", "_plain", false)]              // no tag at all
    [InlineData("_atstart is fine", "_atstart", true)]               // tag at start of string (no preceding char)
    [InlineData("topic:_colon works", "_colon", true)]               // colon is non-word char → valid boundary
    [InlineData("num1_tag here", "_tag", false)]                     // preceded by digit → no match
    [InlineData("camel_case problem", "_case", false)]               // preceded by letter (compound word) → no match
    public async Task ConceptTagCreatedOnlyWhenLeadingUnderscore(string content, string tag, bool expectLinked)
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "concept test", content, ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        var linked = await ThoughtInConcept(postResult.Payload, tag);
        Assert.Equal(expectLinked, linked);
    }

    // ── Duplicate tags ──────────────────────────────────────────────────────────

    [Fact]
    public async Task DuplicateConceptTagsLinkThoughtOnce()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "dedup concept test", "_dogs and _dogs again", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.Equal(1, await ThoughtCountInConcept(postResult.Payload, "_dogs"));
    }

    // ── Ancestor expansion ─────────────────────────────────────────────────────

    [Fact]
    public async Task TwoPartTagCreatesRootAncestor()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "two part tag", "this is _what_is cool", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_what"), "thought should be linked to root _what");
        Assert.True(await ThoughtInConcept(postResult.Payload, "_what_is"), "thought should be linked to _what_is");
    }

    [Fact]
    public async Task ThreePartTagCreatesAllAncestors()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "three part tag", "content _a_b_c here", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_a"), "thought should be linked to _a");
        Assert.True(await ThoughtInConcept(postResult.Payload, "_a_b"), "thought should be linked to _a_b");
        Assert.True(await ThoughtInConcept(postResult.Payload, "_a_b_c"), "thought should be linked to _a_b_c");
    }

    // Four-segment tag: regex matches all parts, expanding to 4 ancestors → exceeds limit → rejected
    [Fact]
    public async Task FourSegmentTagExceedsConceptLimitAndFails()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "four segment", "_p_q_r_s and more text", ThoughtShape.Circle, 0, 0);
        Assert.False(postResult.IsSuccess, "_p_q_r_s expands to 4 ancestors which exceeds the limit");
        Assert.Equal(ErrorCode.BadRequest, postResult.Error?.Code);
    }

    // ── Shared ancestor deduplication ──────────────────────────────────────────

    // _dogs + _dogs_cats → _dogs ancestor appears once, _dogs_cats once
    [Fact]
    public async Task RootTagAndChildAncestorDeduped()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "root child dedup", "_dogs _dogs_cats content", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.Equal(1, await ThoughtCountInConcept(postResult.Payload, "_dogs"));
        Assert.Equal(1, await ThoughtCountInConcept(postResult.Payload, "_dogs_cats"));
    }

    // _a_b + _a_b_c share _a and _a_b ancestors → each linked once
    [Fact]
    public async Task SharedAncestorsLinkedOnce()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "shared ancestor", "_a_b and _a_b_c content", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.Equal(1, await ThoughtCountInConcept(postResult.Payload, "_a"));
        Assert.Equal(1, await ThoughtCountInConcept(postResult.Payload, "_a_b"));
        Assert.Equal(1, await ThoughtCountInConcept(postResult.Payload, "_a_b_c"));
    }

    // ── Multiple distinct tags ─────────────────────────────────────────────────

    [Fact]
    public async Task TwoDistinctTagsBothLinked()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "two tags", "_dogs _cats something cool", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_dogs"), "_dogs should be linked");
        Assert.True(await ThoughtInConcept(postResult.Payload, "_cats"), "_cats should be linked");
    }

    [Fact]
    public async Task ThreeDistinctTagsAllLinked()
    {
        var postResult = await Logic.PostThought(fixture.UserId1, "three tags", "_alpha _beta _gamma check", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_alpha"), "_alpha missing");
        Assert.True(await ThoughtInConcept(postResult.Payload, "_beta"), "_beta missing");
        Assert.True(await ThoughtInConcept(postResult.Payload, "_gamma"), "_gamma missing");
    }

    // ── Link and concept interplay ─────────────────────────────────────────────

    [Fact]
    public async Task ThoughtLinkAndConceptTagCoexist()
    {
        var content = $"[{fixture.ThoughtId1}][linked thought] plus _solar here";
        var postResult = await Logic.PostThought(fixture.UserId1, "link and concept", content, ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_solar"), "_solar should be linked");
    }

    [Fact]
    public async Task ThreeLinksAndOneConceptAllWork()
    {
        var content = $"[{fixture.ThoughtId1}][l1] [{fixture.ThoughtId2}][l2] [{fixture.ThoughtId3}][l3] _ocean cool";
        var postResult = await Logic.PostThought(fixture.UserId1, "three links one concept", content, ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_ocean"), "_ocean should be linked");
    }

    // Concept tag embedded in link display text is extracted (regex runs on full content string)
    [Fact]
    public async Task ConceptTagInLinkDisplayTextIsExtracted()
    {
        var content = $"[{fixture.ThoughtId1}][talking about _reef here]";
        var postResult = await Logic.PostThought(fixture.UserId1, "concept in link text", content, ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_reef"), "_reef inside link text should still be extracted");
    }

    // ── Complex / longer content ───────────────────────────────────────────────

    [Fact]
    public async Task ConceptTagAtEndOfLongContent()
    {
        var padding = new string('x', 200);
        var content = $"this is a long thought with lots of filler content {padding} and finally _summit";
        var postResult = await Logic.PostThought(fixture.UserId1, "long content tag at end", content, ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_summit"), "_summit at end of long content should be linked");
    }

    [Fact]
    public async Task MultipleTagsInLongContentWithLinks()
    {
        var content = $"opening thoughts about _science and then [{fixture.ThoughtId2}][referenced thing] " +
                      $"followed by more words about _nature and finally a wrap up sentence here";
        var postResult = await Logic.PostThought(fixture.UserId1, "mixed long content", content, ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_science"), "_science missing");
        Assert.True(await ThoughtInConcept(postResult.Payload, "_nature"), "_nature missing");
    }

    // ── Same concept across multiple thoughts ──────────────────────────────────

    [Fact]
    public async Task TwoThoughtsTaggedWithSameConceptBothAppear()
    {
        var post1 = await Logic.PostThought(fixture.UserId1, "first shared", "content about _cosmos here", ThoughtShape.Circle, 0, 0);
        var post2 = await Logic.PostThought(fixture.UserId2, "second shared", "more on _cosmos topic", ThoughtShape.Circle, 0, 0);
        Assert.True(post1.IsSuccess, post1.Error?.Message);
        Assert.True(post2.IsSuccess, post2.Error?.Message);

        var concept = await ConceptData.GetConceptWithChildren("_cosmos");
        Assert.True(concept.IsSuccess);
        var thoughtIds = concept.Payload!.Thoughts.Select(t => t.Id).ToList();
        Assert.Contains(post1.Payload, thoughtIds);
        Assert.Contains(post2.Payload, thoughtIds);
    }

    // ── Too many concepts (server-side limit: >3 expanded tags → BadRequest) ───

    [Fact]
    public async Task ExactlyThreeConceptsFromThreePartTagSucceeds()
    {
        // _m_n_o expands to _m, _m_n, _m_n_o = exactly 3 concepts
        var postResult = await Logic.PostThought(fixture.UserId1, "exactly three", "_m_n_o content here", ThoughtShape.Circle, 0, 0);
        Assert.True(postResult.IsSuccess, postResult.Error?.Message);

        Assert.True(await ThoughtInConcept(postResult.Payload, "_m_n_o"));
    }

    [Fact]
    public async Task FourDistinctTagsExceedsLimitAndFails()
    {
        // _w _x _y _z → 4 expanded concepts
        var postResult = await Logic.PostThought(fixture.UserId1, "four tags fail", "_w _x _y _z here", ThoughtShape.Circle, 0, 0);
        Assert.False(postResult.IsSuccess, "four distinct concept tags should be rejected");
        Assert.Equal(ErrorCode.BadRequest, postResult.Error?.Code);
    }

    [Fact]
    public async Task ThreePartTagPlusExtraTagExceedsLimitAndFails()
    {
        // _j_k_l expands to 3, plus _extra = 4 total
        var postResult = await Logic.PostThought(fixture.UserId1, "three part plus one", "_j_k_l plus _extra here", ThoughtShape.Circle, 0, 0);
        Assert.False(postResult.IsSuccess, "_j_k_l (_j,_j_k,_j_k_l) + _extra = 4 should be rejected");
        Assert.Equal(ErrorCode.BadRequest, postResult.Error?.Code);
    }

    [Fact]
    public async Task TooManyConceptsDoesNotInsertThought()
    {
        // verify the thought is not persisted when concept limit is exceeded
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();
        var postResult = await Logic.PostThought(fixture.UserId1, "rejected thought", "_aa _bb _cc _dd rejected", ThoughtShape.Circle, 0, 0);
        Assert.False(postResult.IsSuccess);

        var fetchResult = await data.GetThoughtById(postResult.Payload);
        Assert.False(fetchResult.IsSuccess);
    }

    [Fact]
    public async Task FourLayersGetRejected()
    {
        var data = fixture.Services.GetRequiredService<IThoughtDataContract>();
        var postResult = await Logic.PostThought(fixture.UserId1, "rejected thought", "this: _aa_bb_cc_dd is rejected", ThoughtShape.Circle, 0, 0);
        Assert.False(postResult.IsSuccess);

        var fetchResult = await data.GetThoughtById(postResult.Payload);
        Assert.False(fetchResult.IsSuccess);
    }
}
