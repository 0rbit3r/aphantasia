using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Auth
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

        public static SymmetricSecurityKey GetJwtSecurityKey(IConfiguration config)
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.GetValue<string>("JwtSecurityKey")!));
        }

        public static string GenerateJwtToken(int id, string username, IConfiguration config)
        {
            var securityKey = GetJwtSecurityKey(config);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: new[] {
                    new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                    new Claim(ClaimTypes.Name, username)
                },
                expires: DateTime.Now.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
