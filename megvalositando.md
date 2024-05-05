1. A játékmező létrehozását úgy valósítjuk meg, hogy megadjuk a sorok és oszlopok számát, majd ezek alapján méretezzük és elrendezzük az elemeket. Például, ha 8 sor és oszlop van, és az elemek mérete 64px széles, akkor kiszámoljuk az egyenletes térközt az elemek között. Ennek lehet egy MIN és egy MAX értéke is, amelyeket beállíthatunk, és amelyek határozzák meg a tábla és az elemek közötti helyet.
2. Készítünk egy metódust az elemek létrehozására a táblában. Ez úgy történik, hogy minden elemnek egyedi azonosítót adunk, vagy egyedileg hivatkozhatunk rájuk, így ha a felhasználó rákattint egy elemre, tudjuk, melyikre kattintott, és bármelyik másik elemet is megtalálhatjuk.
3. Implementálunk egy módszert, amellyel a felhasználó képes lesz felcserélni két elemet. Ehhez létrehozunk néhány mérőszámot, amelyek segítenek eldönteni, hogy az elemek cserélhetőek-e, mennyire közel vannak egymáshoz, stb.
4. Ha a felhasználó felcseréli az elemeket, és 3 vagy több ugyanolyan típusú elem van egy sorban vagy oszlopban, ellenőrizzük, hogy van-e további csatlakozó elem, amelyből további elemek eltüntethetőek. Az összes releváns elemet megjelöljük, majd eltávolítjuk őket, és animációval eltüntetjük.
5. Az eltűnő elemek után megnézzük, hogy van-e elem az eltávolított elemek fölött. Ha van, ezek az elemek kapnak egy gravitációs osztályt, és lefele esnek.
6. Ha volt eltűnő elem, új elemeket hozunk létre fentről, amelyek szintén kapnak egy gravitációs osztályt, majd lefuttatjuk a leesést. Ha üres hely marad a pályán, új elemeket hozunk létre, amíg be nem telik a tábla.
7. Az eltűnő elemek alapján kiszámítjuk, hogy mennyi pontot érnek. Minden eltűnt elem 10 pontot ér, és minden további eltűnt ugyanolyan színű elemért a pontszámot megszorozzuk 1.5-tel. Ezután összegezzük a pontokat az eltűnt elemek számával.
8. Hozzáadjuk a megszerzett pontokat a pontszámlálóhoz, és ha elérünk egy bizonyos pontszámot, átlépünk a következő pályára.
9. Az első cserénél elindítjuk a stoppert, és folyamatosan csökkentjük. Ha a felhasználó elemeket cserél, és van eltűnt elem, az időt hozzáadhatjuk.
10. Amikor az elemekkel interakcióba lépünk, animációt és hanghatást játszunk le.
11. Ha lejár az idő vagy a felhasználó rákattint a feladás gombra, fel kell adnia egy felhasználónevet és az adott pontszámot elmentjük. Ezeket a list.html oldalon lehet megtekinteni.
12. A játék alatt rúnák is eshetnek alacsony eséllyel, amelyek különböző bónuszokat nyújthatnak. Ezek csak az adott pályán érvényesek, de bármennyi ideig tárolhatjuk őket.
//TODO: Kitalálni legalább 5 power up-ot.
//TODO: A következő pályákhoz ki kell találnunk valami eltérést az elsőhöz képest.


folyamat: Létrehozzuk a táblát, és a köveket tárolo 2d-s array-t .
A tábla minden slot-jára létrehozunk egy gemet- ami megkapja a megfelelő pozíciót.
Megkapják a gemek a megfelelő helyüket, megkapják a rájuk kattintást.
Feltöltjük a táblát és a gemeket tartalmazó array-okat, és eltároljuk egy másik arrayban az adott gemek típusát.
Ha rákattintunk az egyik elemre akkor azt elmenti a selectedgem-be majd ha egy másikra is akkor megcseréli a kettőt.
