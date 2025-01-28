
import { ChangeEvent, useEffect, useState } from 'react';
import { getUserSettings, postUserSettings } from '../../api/UserSettingsApiClient';
import { Localization } from '../../locales/localization';
import { getTotalThoughtsCount } from '../../api/graphClient';

const colors = [
"#85E085","#FFDD99","#BB8FCE","#FFB6C1","#ADD8E6","#D5DBDB","#7DCEA0","#F39C12","#DC7633","#8E44AD","#52BE80","#E59866","#D35400","#EB984E","#85C1C2",
"#D7DBDD","#5DADE2","#58D68D","#F7DC6F","#A569BD","#F1948A","#85C1E9","#73C6B6","#82E0AA","#F8C471","#3498DB","#28B463","#F1C40F","#9B59B6",
"#E74C3C","#7FB3D5","#48C9B0","#45B39D","#F5B041","#C39BD3","#1F618D","#1D8348","#B7950B","#633974","#922B21","#2874A6","#148F77","#117A65","#B9770E","#6C3483",
"#76D7C4","#F8A488","#F9E79F","#F5CBA7","#E6B0AA","#D7BDE2","#A9CCE3","#A3E4D7","#AED6F1","#F7C6C7","#FFDAB9","#E3F2FD","#FFAA85","#B3E5FC",
"#FFDDC1","#FFF176","#FFAB91","#CFD8DC","#FFE082","#F48FB1","#B2EBF2","#EC407A","#BA68C8","#FF7043","#7986CB","#FFD54F","#81C784","#A1887F",
"#64B5F6","#E57373","#FFB74D","#4FC3F7","#AED581","#9575CD","#FF8A65","#4DD0E1","#81D4FA","#C5E1A5","#FFEB3B","#D1C4E9","#FFCCBC","#FFECB3","#C5CAE9",
"#BBDEFB","#B2DFDB","#FFCDD2","#FFE0B2","#C8E6C9","#FFF9C4",
// thanks chatGPT

'#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
'#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
'#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
'#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
'#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
'#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
'#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
'#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
'#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF' //thanks https://gist.github.com/mucar/3898821
];


function UserAndSettings() {
    const [username, setUsername] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("#dddddd");
    const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
    const [ColorValidationMessage, setColorValidationMessage] = useState<string | null>(null);
    const [maxThoughtsValidationMessage, setMaxThoughtsValidationMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [maxThoughtsInput, setMaxThoughtsInput] = useState<string | undefined>(undefined);
    const [thoughtsCount, setThoughtsCount] = useState<number>(0);
    const [savedPositionsNumber, setSavedPositionsNumber] = useState<number>(0);

    useEffect(() => {
        const getSettings = async () => {
            const response = await getUserSettings();
            if (response.ok) {
                setSelectedColor(response.data?.color!);
                setMaxThoughtsInput(response.data?.maxThoughts!.toString());
                setUsername(response.data?.username!)
            }
            else {
                setColorValidationMessage(response.error!);
            }
        }
        getSettings();

        const getThoughtsCount = async () => {
            const response = await getTotalThoughtsCount();
            if (response.ok) {
                
                setThoughtsCount(response.data!);
            }
            else {
                setColorValidationMessage(response.error!);
            }
        }
        getThoughtsCount();

        setSavedPositionsNumber(localStorage.getItem('thoughts-cache') ? JSON.parse(localStorage.getItem('thoughts-cache')!).length : 0); //todo magic string
    }, []);

    function handlePaletteColorChoice(index: number) {
        setSelectedColor(colors[index]);
        setIsPickerOpen(false);
    }

    function openColorPicker() {
        setIsPickerOpen(true);
    }

    function closeColorPicker() {
        setIsPickerOpen(false);
    }

    async function saveSettings() {
        setColorValidationMessage(null);
        setSuccessMessage(null);
        if (maxThoughtsInput === undefined) {
            setMaxThoughtsValidationMessage(Localization.MaxThoughtsValidation);
            return;
        }
        var result = await postUserSettings({ color: selectedColor, username: username, maxThoughts: parseInt(maxThoughtsInput) });
        if (result.ok) {
            setSuccessMessage(Localization.SettingsSaved);
        }
        else {
            setColorValidationMessage(result.error!);
        }
    }

    function logOut() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    function handleHexInputChange(e: React.ChangeEvent<HTMLInputElement>): void {

        setSelectedColor(_ => e.target.value);

        const hexColorRegexp = /^#([A-Fa-f0-9]{6})$/;
        if (!hexColorRegexp.test(e.target.value)) {
            setMaxThoughtsValidationMessage(Localization.ColorValidation);
        }
        else {
            setMaxThoughtsValidationMessage(null);
        }
    }

    function handleMaxThoughtsChange(e: ChangeEvent<HTMLInputElement>): void {

        // console.log(e.target.value);
        const number = parseInt(e.target.value)
            ? parseInt(e.target.value)
            : 0;

        setMaxThoughtsInput(e.target.value);

        if (number < 10) {
            setColorValidationMessage(Localization.MaxThoughtsValidation);
        }
        else {
            setColorValidationMessage(null);
        }
    }

    function handleDeleteThoughtsPositionsButtonClick() {
        localStorage.removeItem('thoughts-cache'); //todo magic string
        setSuccessMessage(Localization.ThoughtsPositionsDeleted);
        setSavedPositionsNumber(0);
    }

    return (
        <div className="content-container settings-container" style={{ padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <h1>{Localization.UserSettings}</h1>
            <button className='button-primary' disabled={ColorValidationMessage !== null} onClick={saveSettings}>{Localization.SaveSettingsButton}</button> <br />
            {ColorValidationMessage && <pre className='red-text'>{ColorValidationMessage}</pre>}
            {maxThoughtsValidationMessage && <pre className='red-text'>{maxThoughtsValidationMessage}</pre>}
            {successMessage && <pre className='green-text'>{successMessage}</pre>}
            <hr></hr>
            <label className='settings-label'>{Localization.ColorLabel} </label>
            <span className='username' style={{ color: selectedColor }}
                onClick={openColorPicker}
            >{username}</span><span className='settings-hint'> {Localization.ClickHere}</span>
            {isPickerOpen && (
                <div className="color-picker-overlay" onClick={closeColorPicker}>
                    <div className="color-picker-popup" onClick={closeColorPicker}>
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className={`color-dot ${color === selectedColor ? 'selected' : ''}`}
                                style={{ backgroundColor: color, cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', margin: '5px' }}
                                onClick={() => handlePaletteColorChoice(index)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <br></br>
            <input className='color-hex-input' type='text' value={selectedColor} onChange={(e) => handleHexInputChange(e)}></input>
            <hr></hr>

            <p>
                <label className='settings-label'>{Localization.MaxThoughtsLabel}</label><br />
                <input className='max-thoughts-input' type='number' value={maxThoughtsInput} onChange={e => handleMaxThoughtsChange(e)}></input><br />
                <label className='settings-hint'>{Localization.MaxThoughtsHint}</label><br/>
                <label className='settings-hint'>{Localization.CurrentNumberOfThoughtsLabel} <b>{thoughtsCount}</b></label>
            </p>

            <hr/>
            <button className='button-secondary settings-button' onClick={handleDeleteThoughtsPositionsButtonClick}>{Localization.DeleteThoughtsPositions}</button><br />
            <label className='settings-hint'>{Localization.DeleteThoughtsPositionsHint}</label> <br/>
            <label className='settings-hint'>{Localization.CurrentlySavedThoughtsLabel} <b>{savedPositionsNumber}</b></label>
            <hr/>

            <button className='button-secondary' onClick={logOut}>{Localization.LogoutButton}</button>
        </div>
    );
}

export default UserAndSettings;
