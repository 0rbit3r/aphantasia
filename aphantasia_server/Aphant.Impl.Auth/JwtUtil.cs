using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Aphant.Impl.Auth
{
    internal static class JwtUtil
    {
        public static TokenValidationParameters GetTokenValidationParameters(IConfiguration config)
        {
            return new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = GetJwtSecurityKey(config),
                ValidateIssuer = false,
                ValidateAudience = false
            };
        }

        public static string GenerateJwtToken(Guid id, IConfiguration config)
        {
            var securityKey = GetJwtSecurityKey(config);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: [
                    new Claim("id", id.ToString()),
                ],
                expires: DateTime.UtcNow.AddHours(24 * 3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static SymmetricSecurityKey GetJwtSecurityKey(IConfiguration config)
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.GetValue<string>("JwtSecurityKey")!));
        }
    }
}
