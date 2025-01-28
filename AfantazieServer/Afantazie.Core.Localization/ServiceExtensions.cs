﻿using Afantazie.Core.Localization.Errors;
using Afantazie.Core.Localization.SystemMessages;
using Afantazie.Core.Localization.ThoughtValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Afantazie.Core.Localization
{
    public static class ServiceExtensions
    {
        public static void AddLanguageLocalization(
            this IServiceCollection services,
            IConfiguration configuration)
        {

            var language = configuration.GetValue<string>("ApplicationLanguage");

            if (language == "cz")
            {
                services.AddSingleton<IAuthValidationMessages, AuthValidation_CZ>();
                services.AddSingleton<IChatMessages, ChatMessages_CZ>();
                services.AddSingleton<IThoughtValidationLocalization, ThoughtValidationLocalization_CZ>();
            }
            else
            {
                services.AddSingleton<IAuthValidationMessages, AuthValidation_EN>();
                services.AddSingleton<IChatMessages, ChatMessages_EN>();
                services.AddSingleton<IThoughtValidationLocalization, ThoughtValidationLocalization_EN>();
            }
        }
    }
}
