using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model
{
    public class User
    {
        public int Id { get; set; }

        public required string Username { get; set; }

        public required string Email { get; set; }

        public string Color { get; set; } = "#ffffff";
    }
}
