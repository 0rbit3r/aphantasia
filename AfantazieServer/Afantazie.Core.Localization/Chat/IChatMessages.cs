using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.SystemMessages
{
    public interface IChatMessages
    {
        string ConnectedSuccessfuly { get; }

        string NooneIsHere { get; }

        string SomebodyIsHere { get; }

        string You { get; }
    }
}
