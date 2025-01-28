using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model
{
    public class DataContextProvider(IConfiguration _config)
    {
        public AfantazieDataContext GetDataContext()
        {
            string connection = _config.GetConnectionString("DefaultConnection");
            DbContextOptions<AfantazieDataContext> options = new DbContextOptionsBuilder<AfantazieDataContext>()
                .UseNpgsql(connection)
                .Options;

            return new AfantazieDataContext(options);
        }
    }
}
