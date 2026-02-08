namespace Aphant.Core.Dto.Results
{

    public class Result
    {
        public Error? Error { get; init; } = null;

        public bool IsSuccess => Error is null;

        protected Result(Error error)
        {
            Error = error;
        }

        protected Result() { }

        public static Result Success() => new Result();

        public static Result<T_Value> Success<T_Value>(T_Value payload) => new Result<T_Value>(payload);

        public static Result Failure(Error error) => new Result(error);

        public static Result<T_Value> Failure<T_Value>(Error error) => new Result<T_Value>(error);


        // Conversion operators
        public static implicit operator Result(Error error) => new Result(error);
    }

    public class Result<T_Value> : Result
    {
        public T_Value? Payload { get; init; } = default;

        internal Result(T_Value payload)
        {
            Payload = payload;
        }

        internal Result(Error error)
        {
            Error = error;
        }

        // Conversion operators
        public static implicit operator Result<T_Value>(T_Value value) => new Result<T_Value>(value);

        public static implicit operator Result<T_Value>(Error error) => new Result<T_Value>(error);
    }
}
