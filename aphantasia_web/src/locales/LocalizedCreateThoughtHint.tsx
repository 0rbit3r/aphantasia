export const LocalizedCreateThoughtHint = () => {

    if (import.meta.env.VITE_LANGUAGE === 'cz')
        return <>
            <h1>Nápověda</h1>
            <h2>Odkazy</h2>
            <p>
                Komentář, odpověď, otázka, pokračování nebo kritika jiné myšlenky - to vše a víc může být důvod, proč chceš ve své myšlence odkázat na jinou.
            </p>
            <p>
                Myšlenky, které na sebe odkazují, se navzájem přitahují a díky tomu můžeš ovlivnit, kde se v grafu bude nacházet jak tvá nová myšlenka tak
                do jisté míry i její odkazy.
            </p>
            <h2>Používání</h2>
            <p>
                Nejjednodušší způsob, jak se odkázat na myšlenku, je použít tlačítko <b>Přidat odkaz</b> a vybrat si myšlenku, na kterou chceš odkázat. Můžeš jí vložit kamkoliv do textu pomocí pozice kurzoru.
            </p>
            <p>
                Odkaz ale můžeš přidat a upravit i manuálně a to pomocí tvaru: <br />
                <b>[ID MYŠLENKY][TEXT]</b>.
            </p>
            <p>
                <b>ID MYŠLENKY</b> musí odkazovat na nějakou již existující myšlenku.<br />
                <b>TEXT</b> může být libovolný a je to právě to, co se zobrazí ve výsledném odkazu.<br />
            </p>
            <p>
                To se hodí hlavně, když je název odkazované myšlenky dlouhý nebo se jinak nehodí to tvého textu.
            </p>
            <p>
                Například místo<br />
                "První myšlenka na Afantázi je: <b>[1][Hello World!]</b>"<br />
                můžeš napsat<br />
                "První myšlenka na Afantázii je <b>[1][tato]</b>."
            </p>
            <p>
                Jedna myšlenka může obsahovat až tři odkazy.
                {/* Ale pozor! Čím víc odkazů, tím slabší bude síla, kterou tvoje myšlenka přitahuje ostatní.  */}
            </p>
        </>
    else
        return <>
            <h1>Hint</h1>
            <h2>References</h2>
            <p>
                Whether to reply, continue or criticize another thought you might want to reference another thought in yours.  
            </p>
            <p>
                Referenced thoughts attract each other which means you can influence position of your thought as well as to some extent its references.
            </p>
            <h2>Usage</h2>
            <p>
                The esiest way to add a reference a thought is to press <b>Add reference</b> and search in the list. You can place it anywhere in the text using cursor position.

            </p>
            <p>
                You can also add a refrence manually by using this format: <br />
                <b>[THOUGHT ID][TEXT]</b>.
            </p>
            <p>
                where <b>THOUGHT ID</b> must reference another existing thought<br />
                and <b>TEXT</b> can be anything you want.<br />
            </p>
            <p>
                This is usefull especially when the name of the referenced thought is long or otherwise doesn't fit your text.
            </p>
            <p>
                For example, instead of<br />
                "The first thought on Afantázie is <b>[1][Hello World!]</b>"<br />
                you can write<br />
                "The first thought on Afantázie is <b>[1][this one]</b>."
            </p>
            <p>
                One thought can have up to three references.
                {/* Ale pozor! Čím víc odkazů, tím slabší bude síla, kterou tvoje myšlenka přitahuje ostatní.  */}
            </p>
        </>
}