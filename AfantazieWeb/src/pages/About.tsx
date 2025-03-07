
function About() {
  return import.meta.env.VITE_LANGUAGE === "cz" ?
    (
      <div className={"content-container about-page " + (window.innerWidth > 500 ? "avoid-navbar" : "")}>
        <h2>Co je Afantázie?</h2>
        Afantázie postupně vzniká coby můj programovací projekt. Jejím prvním cílem je vytvořit grafové udělátko pro interakci s ostatními uživateli
        a jejich příspěvky, kterým říkám myšlenky.<br />
        <br />
        Myšlenky, stejně jako skoro všechny ostatní příspěvky na internetu, jsou jenom nějaký kus textu (časem i jiných typů médií),
        který nějak souvisí s jinými příspěvky. Na některé odpovídá, další zmiňuje a jiné zase odkazují na něj. Na Afantázii chci umět tyto vztahy zobrazit a umožnit
        jejich prozkoumávání.
        <h2>Podmínky používání a Zásady o ochraně osobních údajů</h2>
        Zatím jsem si nenaštudoval, co mě sem byrokracie nutí napsat...<br />
        Ale stručně a lidsky - registrací na této stránce:
        <ul>
          <li>Souhlasíš, že se tu budeš chovat slušně a svými příspěvky nebudeš porušovat zákony České Republiky</li>
          <li>Já se zavazuji, že se v rámci svých sil postarám o udržení Tvých údajů v bezpečí</li>
          <li>Data, která uchovávám jsou:
            <ul>
              <li>Uživatelské jméno</li>
              <li>Email</li>
              <li>Hash hesla</li>
              <li>Uživatelské nastavení (zvolená barva)</li>
              <li>Logy běžných technických dat nezbytně souvisejících s provozem stránky (IP adresa, typ prohlížeče, časy přístupů apod.)</li>
            </ul>
          </li>
        </ul>
        <h2>Cookies</h2>
        Až na funkční cookies pro přihlašování a cachování pozic myšlenek tu žádné nejsou. Jsi možná na tom posledním webu na světě, který tě nešmíruje.


      </div>
    )
    :
    (
      <div className={"content-container about-page " + (window.innerWidth > 500 ? "avoid-navbar" : "")}>
        <h2>What is Aphantasia?</h2>
        Aphantasia is an idea of mine.
        Its goal is to create a graph doohickey for interaction between users and their posts I'm calling Thoughts.<br />
        <br />
        A thought is just a piece of text that can reference other thoughts.
        It can continue some, reply to others while being mentioned by a good deal of more. I want to visualize these relationships and allow their exploration.
        <h2>Terms and conditions</h2><br />
        Briefly said - by registering on this site:
        <ul>
          <li>You agree to behave yourself and not break any relevant laws.</li>
          <li>I agree to keep your data safe.</li>
          <li>Data I store include:
            <ul>
              <li>Username</li>
              <li>Email</li>
              <li>Password Hash</li>
              <li>User settings (chosen color...)</li>
              <li>Logs of common technical data related to hosting a website (time of access, IP address, type of browser etc.)
              </li>
            </ul>
          </li>
        </ul>
        <h2>Cookies</h2>
        I only use local storage cookies to:
        <ul>
          <li>keep you logged in</li>
          <li>cache thought positions</li>
        </ul>
        No tracking cookies here I'm afraid.
      </div>
    )
}

export default About