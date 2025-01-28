using Afantazie.Core.Localization;
using Afantazie.Core.Model.Results.Errors;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data.SqlTypes;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results
{
    public class MultiError : ErrorWithMessage
    {
        private int _code { get; set; }
        public override int Code => _code;

        public override string Message { get {
                return Errors
                    .Where(e => e is ErrorWithMessage)
                    .Select(em => $"- {((ErrorWithMessage)em).Message}")
                    .Aggregate((a, b) => $"{a}\n{b}");
            }
        }
        public List<Error> Errors { get; } = new();

        public void Add(Error error)
        {
            Errors.Add(error);
            if (error.Code > _code)
                _code = error.Code;
        }

        public bool Any() => Errors.Any();
    }
}
