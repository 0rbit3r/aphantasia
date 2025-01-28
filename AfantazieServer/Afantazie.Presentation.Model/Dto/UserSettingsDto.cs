using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto
{
    public class UserSettingsDto
    {
        public required string Username { get; set; }

        public required string Color { get; set; }

        public int MaxThoughts { get; set; }
    }
}
