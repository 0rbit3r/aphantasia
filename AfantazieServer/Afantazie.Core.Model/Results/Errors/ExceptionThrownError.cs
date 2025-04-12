namespace Afantazie.Core.Model.Results.Errors
{
    public class ExceptionThrownError : Error
    {
        public override int Code => 500;

        public Exception Exception { get; }

        public ExceptionThrownError(Exception e)
        {
            Exception = e;
        }
    }
}