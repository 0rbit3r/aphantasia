using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Api.Helpers
{
    internal static class DateFormatHelper
    {
        public static string ConvertSecondsToReadable(TimeSpan time) =>
            time.TotalSeconds switch
            {
                < 60 => $"{time.Seconds} s",
                < 3600 => $"{time.Minutes} min",
                < 86400 => $"{time.Hours} h",
                _ => $"{time.Days} d"
            };
    }
}
