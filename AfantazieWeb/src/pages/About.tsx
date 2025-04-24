
import packageJson from '../../package.json'; // adjust the path if needed

function About() {
  return import.meta.env.VITE_LANGUAGE === "cz" ?
    (
      <div className="content-container about-page">
        <span>Verze: {packageJson.version} Alpha</span>
        <hr />
        <h2>Co je Afantázie?</h2>
        <p>
          Říkám tomu sociální síť pro grafové nadšence. Je to místo, kde se Tvoje myšlenky nachází v prostoru a čase, navzájem propojené, a prozkoumatelné pomocí grafového zobrazení.<br />
        </p>
        <p>
          Video tutoriál již brzy ve Vašich kinech. (A pokud ne, tak alespoň na youtubu.)
        </p>
        <p>
          Kód je pod open-source licencí a k dispozici na <a href="https://github.com/0rbit3r/aphantasia" target="_blank" rel="noopener noreferrer">GitHubu</a>.
          Tam najdeš také informace ohledně přispívání, API a dalších podrobností ohledně softwaru.
        </p>
        <p>Afantázie má také přidružený <a href="https://www.youtube.com/@AphantasticChannel" target="_blank" rel="noopener noreferrer">youtubový kanál</a>. (Ovšem v angličtině)</p>
        <p>
          Projekt Afantázie je pojmenovaný po Afantázii - vrozená neschopnost vizuální představivosti - <a href="https://en.wikipedia.org/wiki/Aphantasia" target="_blank" rel="noopener noreferrer">Wikipedie</a> nebo rychlé googlení ti kdyžtak poví víc.
        </p>
        <p>
          Mezinárodní verze této stránky je na <a href="https://aphantasia.io" target="_blank" rel="noopener noreferrer">aphantasia.io</a>.
        </p>
        <hr />
        <h2>Podmínky používání</h2>
        Stručně řečeno, registrací na této stránce:
        <ul>
          <li>Souhlasíš s tím, že se tu nebudeš chovat jako tydýt.</li>
          <li>Já souhlasím s tím, že v rámci svých možností uchovám Tvoje data v bezpečí.</li>
        </ul>
        <hr />
        <h2>Ochrana soukromí</h2>
        <h3>Cookies</h3>
        Afantázie využívá "local storage" cookies k uchování:
        <ul>
          <li>Přihlášeného uživatele</li>
          <li>Pozic myšlenek v grafu</li>
          <li>Nastavení grafového zobrazení</li>
        </ul>
        Kromě toho nepoužívám žádné cookies, ani služby třetích stran. Dost možná jsi na posledním webu na internetu, který tě nešpehuje.
        <h3>Uživatelská data</h3>
        Data, která skladuji, se skládají z:
        <ul>
          <li>Uživatelského jména</li>
          <li>Emailu</li>
          <li>Zahešovaného hesla</li>
          <li>Uživatelského nastavení (Barva, popisek)</li>
          <li>Logy běžných technických informací souvisejících s provozem stránky (informace o HTTP požadavcích, časy přístupů, IP adresy apod.)
            <ul>
              <li>Tyto logy jsou bežně zahozeny po 7 dnech.</li>
              <li>V případě detekce nekalých aktivit je přidružená IP adresa uchována déle z důvodu bezpečnosti.</li>
            </ul>
          </li>
        </ul>
        <p>Osobní data uživatelů nejsou a nikdy nebudou poskytována třetím stranám.</p>
        <p>Myšlenky jsou veřejně přístupné a v případě jejich smazání autorem jsou z databáze odstraněny kompletně.</p>
        <p>Smazání účtu není podporováno na úrovni aplikace - pro smazání účtu mi prosím napiš žádost na email dole.</p>
        <hr />
        <h2>Kontakt</h2>
        <p>S jakýmikoliv dotazy, požadavky nebo náměty pište na aphantastic[dot]channel[at]gmail[dot]com.</p>
      </div>
    )
    :
    (
      <div className="content-container about-page">
        <span>Version: {packageJson.version} Alpha</span>
        <hr />
        <h2>What is Aphantasia?</h2>
        <p>
          I like to call it a social network for graph enthusiasts. It's a place where your thoughts live in time and space, interconnected with others and explorable in a graph view.<br />
        </p>
        <p>
          Tutorial is coming soon.
        </p>
        <p>
          The code is open-source and you can take a look at it on <a href="https://github.com/0rbit3r/aphantasia" target="_blank" rel="noopener noreferrer">GitHub</a>.
          There you can find more information about contributions, API usage and other details related to the software.
        </p>
        <p>There is also an accompanying <a href="https://www.youtube.com/@AphantasticChannel" target="_blank" rel="noopener noreferrer">youtube channel</a>.</p>
        <p>
          Aphantasia the software is named after aphantasia the condition - see <a href="https://en.wikipedia.org/wiki/Aphantasia" target="_blank" rel="noopener noreferrer">Wikipedia</a> for more information.
        </p>
        <hr />
        <h2>Terms and Conditions</h2>
        Briefly said - by registering on this site:
        <ul>
          <li>You agree to behave yourself and not break any relevant laws.</li>
          <li>I agree to do my best to keep your data safe.</li>
        </ul>
        <hr />
        <h2>Privacy Policy</h2>
        <h3>Cookies</h3>
        Aphantasia uses your browser's local storage to:
        <ul>
          <li>Keep you logged in</li>
          <li>Cache thought positions in the graph</li>
          <li>Store graph settings</li>
        </ul>
        Other than that, there are no cookies or third-party services used.
        Chances are you are on the last place on the internet that doesn't spy on you to sell your data to the highest bidder.

        <h3>User Data</h3>
        Data stored by Aphantasia is made up of:
        <ul>
          <li>Username</li>
          <li>Email</li>
          <li>Password Hash</li>
          <li>User Settings (chosen color, bio)</li>
          <li>Logs of common technical data related to hosting a website (HTTP request information, times of access, IP addresses etc.)
            <ul>
              <li>These logs are discarded after 7 days when no malicious activity is detected.</li>
              <li>Otherwise, the IP address may be retained for an undisclosed period to prevent further disruptions.</li>
            </ul>
          </li>
        </ul>
        <p>Personal data collected by Aphantasia is not and will not be shared with any third parties.</p>
        <p>Thoughts are publicly accessible. When deleted by the author, they are removed completely.</p>
        <p>Account deletion is not implemented on software level yet - to delete your account, please contact me directly (see contact section below).</p>
        <hr />
        <h2>Contact</h2>
        <p>If you have any questions, suggestions, requests or just want to say hi, you can reach out to me at aphantastic[dot]channel[at]gmail[dot]com.</p>
      </div>
    )
}

export default About