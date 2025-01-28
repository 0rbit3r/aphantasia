import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LocationState } from '../../interfaces/LocationState';
import { useState } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { loginUser } from '../../api/AuthApiClient';
import { Localization } from '../../locales/localization';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const location = useLocation();
    const topmessage = (location.state as LocationState)?.message;
    const { setAccessToken } = useAuth();
    const navigate = useNavigate();
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await loginUser(formData);
        if (response.error) {
            setValidationMessage(response.error);
        }
        else {
            setAccessToken(response.data?.token as string);
            navigate('/', { state: { message: Localization.WelcomeBack } as LocationState })// Todo a set of quips.
        }
    }

    return (
        <div className="content-container">

            <div className='auth-form'>
                <h1>{Localization.LoginTitle}</h1>

                {topmessage && <div className="alert">{topmessage}</div>}
                <form onSubmit={handleSubmit}>
                    <p>
                        <input placeholder={Localization.NameOrEmail} type="text" name="email" value={formData.email} onChange={handleChange} />
                    </p>
                    <p>
                        <input placeholder={Localization.Password} type="password" name="password" value={formData.password} onChange={handleChange} />
                    </p>
                    <p>
                        <button type="submit" className='button-primary'>{Localization.LoginButton}</button>
                    </p>
                </form>
                <p>{Localization.DontHaveAnAccount} <Link to="/register">{Localization.RegisterLink}</Link></p>
                {validationMessage && <pre className='red-text'>{validationMessage}</pre>}
            </div>
        </div>
    )
}

export default Login