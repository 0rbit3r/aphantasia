using Aphant.Core.Interface;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Database;

internal partial class DbRepository(
    AphantasiaDataContext _db,
    ILogger<AphantasiaDataContext> _log) : IDataService
{
}