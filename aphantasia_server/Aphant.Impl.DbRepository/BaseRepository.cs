using Aphant.Core.Database;
using Aphant.Core.Interface;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.DbRepository;

internal partial class DatabaseRepository(
    AphantasiaDataContext _db,
    ILogger<AphantasiaDataContext> _log) : IDataService
{
}