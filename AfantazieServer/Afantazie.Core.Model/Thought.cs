﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model
{
    public class Thought
    {
        public int Id { get; set; }

        public required string Title { get; set; }

        public required User Author { get; set; }

        public required string Content { get; set; }

        public required DateTime DateCreated { get; set; }

        public string Color { get; set; } = "#ffffff";

        public ICollection<ThoughtReference> Links { get; set; } = new List<ThoughtReference>();

        public ICollection<ThoughtReference> Backlinks { get; set; } = new List<ThoughtReference>();
        public int Size { get; set; }
    }
}
