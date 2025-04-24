using Afantazie.Core.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto.Thought
{
    public class CreateThoughtDto
    {
        public string Title { get; set; } = "";

        public string Content { get; set; } = "";

        public ThoughtShape Shape { get; set; } = 0;
    }
}
