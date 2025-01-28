import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterRequest } from '../../api/dto/auth/RegisterRequest';
import { registerUser } from '../../api/AuthApiClient';
import { LocationState } from '../../interfaces/LocationState';
import { Localization } from '../../locales/localization';


function Registration() {
    const [formData, setFormData] = useState<RegisterRequest>({ username: '', email: '', password: '' });
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await registerUser(formData);

        if (!response.ok) {
            setValidationMessage(response.error ?? "<unknown error>");
        } else {
            setFormData({ username: '', email: '', password: '' });
            navigate('/login', { state: { message: Localization.RegistrationSuccessful } as LocationState });
        }
    };

    const validationHelpText = Localization.RegistrationHelpMessage;


    return (
        <div className="content-container">
            <div className='auth-form'>
                <h1>{Localization.RegistrationTitle}</h1>
                {!validationMessage && <pre className='validation-help-text'>{validationHelpText}</pre>}
                <form onSubmit={handleSubmit}>
                    <p>
                            <input placeholder={Localization.Name} type="text" name="username" value={formData.username} onChange={handleChange} />
                    </p>
                    <p>
                            <input placeholder={Localization.Email} type="email" name="email" value={formData.email} onChange={handleChange} />
                    </p>
                    <p>
                            <input placeholder={Localization.Password} type="password" name="password" value={formData.password} onChange={handleChange} />
                    </p>
                    <p>
                        <button type="submit" className='button-primary'>{Localization.RegisterButton}</button>
                    </p>
                </form>
                {validationMessage && <pre className='red-text'>{validationMessage}</pre>}
                <p>{Localization.AlreadyHaveAnAccount} <Link to="/login">{Localization.LoginButton}</Link> </p>
                <p>{Localization.ByRegisteringYouAgreeWith} <Link to="/about">{Localization.TermsAndConditions}</Link></p>
            </div>
        </div>
    )
}

export default Registration;