// using Microsoft.EntityFrameworkCore;
// using Microsoft.Extensions.Configuration;

// namespace Aphant.Impl.Database
// {
//     public class DataContextProvider(IConfiguration _config)
//     {
//         public AfantazieDataContext GetDataContext()
//         {
//             string? connection = _config.GetConnectionString("DefaultConnection");
//             if (connection is null) throw new NotImplementedException("No default connection specified.");

//             DbContextOptions<AfantazieDataContext> options = new DbContextOptionsBuilder<AfantazieDataContext>()
//                 .UseNpgsql(connection)
//                 .Options;

//             return new AfantazieDataContext(options);
//         }
//     }
// }

