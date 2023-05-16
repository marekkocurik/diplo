// definovanie funkcie:

const nazovFunkcie = (input) => {};

// funkcia ktora handluje event:

const handleLoginChange = (e) => {
  setLogin(e.target.value);
};

// volanie jednej funkcie:

<div>
  {/* ak zavolam funkciu takto:     -- potom sa do danej funkcie odoslu aj vsetky vstupne parametre (ak nejake existuju) */}
  <Button onClick={nazovFunkcie}></Button>

  {/* vseobecny zapis funkcie, do ktorej mozem pisat kod.
      do () zapisem vstupne parametre, napriklad (x, y, z)
      do {} pisem kod, cize v {} mozem zavolat napriklad 3 funkcie */}
  <Button onClick={() => {}}></Button>

  {/* dalsie priklady: */}
  <Button onClick={() => nazovFunkcie('aoj')}></Button>
  <Button onClick={x => nazovFunkcie(x)}></Button>
  <Button onClick={(x, y) => { nazovFunkcie(x); nazovFunkcie(y) }}></Button>

</div>;
