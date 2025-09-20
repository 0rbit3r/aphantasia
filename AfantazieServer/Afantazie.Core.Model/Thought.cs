using System;
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
        public int Size { get; set; }

        public ThoughtShape Shape { get; set; }

        public double? PositionX { get; set; }
        public double? PositionY { get; set; }

        public bool IsPinned { get; set; } = false;

        public ICollection<ThoughtReference> Links { get; set; } = new List<ThoughtReference>();

        public ICollection<ThoughtReference> Backlinks { get; set; } = new List<ThoughtReference>();

        public ICollection<Concept> Concepts { get; set; } = new List<Concept>();

    }

    public enum ThoughtShape
    {
        Circle = 0,
        Square = 1,
        Triangle = 2,
        ReversedTriangle = 3,
        Diamond = 4,
        Cross = 5,
    }

    public enum ThoughtColor
    {
        None = 0,
        Red = 1,
        Orange = 2,
        Yellow = 3,
        Green = 4,
        Cyan = 5,
        Blue = 6,
        Violet = 7,

        White = 8
    }
}
