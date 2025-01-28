using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto
{
    public class NotificationDto
    {
        public string Title { get; set; } = "";

        public string Text { get; set; } = "";

        public string Color { get; set; } = "";

        public string Time { get; set; } = "";

        public string Link { get; set; } = "";
    }
}
