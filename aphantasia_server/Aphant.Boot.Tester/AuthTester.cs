using Aphant.Core.Contract;
using Aphant.Core.Dto.Results;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Boot.Tester;

public class AuthTester : IClassFixture<AppContainer<AuthTester>>
{
    AppContainer<AuthTester> fixture;
    public AuthTester(AppContainer<AuthTester> fixture)
    {
        this.fixture = fixture;
    }


    [Theory]
    [InlineData("user", "123456Abc", null, null, null)]
    [InlineData("jon", "123456Abs", null, null, null)]
    [InlineData("second-user", "123456Abc", "usermcfakename@valid.com", null, null)]

    [InlineData("user-with-parkinson", "123456abc", null, ErrorCode.BadRequest, "assword")]
    [InlineData("alspdkk", "", null, ErrorCode.BadRequest, "assword")]
    [InlineData("user-who-has-seen-it-all", "klsjeflk", null, ErrorCode.BadRequest, "assword")]
    [InlineData("", "123456Abs", null, ErrorCode.BadRequest, "sername")]
    [InlineData("alspdkkalpsdlksjslkfjksdljfdlskj", "123456789564SSDdfddfd", null, ErrorCode.BadRequest, "sername")]
    [InlineData("=> this", "123456789564SSDdfddfd", null, ErrorCode.BadRequest, "sername")]
    [InlineData("ahzo_es", "123456789564SSDdfddfd", null, ErrorCode.BadRequest, "sername")]
    public async Task Register(string userName, string password, string? email, ErrorCode? expectedError, string? messageContains)
    {
        var authContract = fixture.Services.GetRequiredService<IAuthContract>();

        var result = await authContract.Register(userName, password, email);

        Assert.Equal(expectedError, result.Error?.Code);
        if (expectedError is not null) Assert.Contains(messageContains ?? "đĐ[]", result.Error?.Message);
    }

    [Fact]
    public async Task UsernameTaken()
    {
        var authContract = fixture.Services.GetRequiredService<IAuthContract>();

        var registerResult1 = await authContract.Register("randomusername", "afuckindraGon226", null);
        Assert.True(registerResult1.IsSuccess);

        var registerResult2 = await authContract.Register("randomusername", "afuckindraGon226", null);
        Assert.False(registerResult2.IsSuccess);
        Assert.Equal(ErrorCode.BadRequest, registerResult2.Error?.Code);
        Assert.Contains("username", registerResult2.Error?.Message);
    }

    [Fact]
    public async Task EmailTaken()
    {
        var authContract = fixture.Services.GetRequiredService<IAuthContract>();

        var registerResult1 = await authContract.Register("randomusername3", "afuckindraGon226", "myMail@mail.com");
        Assert.True(registerResult1.IsSuccess);

        var registerResult2 = await authContract.Register("randomusername6", "afuckindraGon226", "myMail@mail.com");
        Assert.False(registerResult2.IsSuccess);
        Assert.Equal(ErrorCode.BadRequest, registerResult2.Error?.Code);
        Assert.Contains("mail", registerResult2.Error?.Message);
    }

    [Fact]
    public async Task Login()
    {
        var authContract = fixture.Services.GetRequiredService<IAuthContract>();

        var registerResult = await authContract.Register("bababooey-bababooey", "someThing.-45", "something@gmail.com");
        Assert.True(registerResult.IsSuccess);

        var wrongPassResult = await authContract.LogIn("bababooey-bababooey", "someTh");
        Assert.False(wrongPassResult.IsSuccess);

        var wrongUsernameResult = await authContract.LogIn("baey", "someThing.-45");
        Assert.False(wrongUsernameResult.IsSuccess);

        var loginUsernameResult = await authContract.LogIn("bababooey-bababooey", "someThing.-45");
        Assert.True(loginUsernameResult.IsSuccess);

        var loginEmailResult = await authContract.LogIn("something@gmail.com", "someThing.-45");
        Assert.True(loginEmailResult.IsSuccess);
    }
}