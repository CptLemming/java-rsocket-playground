import React, { useEffect, useState } from "react";
import { api } from "../../generated/eq";
import { useClient } from "../../client/context";
import { getEqBands, updateEqBand } from "./utils";

const EqPage = () => {
  const client = useClient();
  const [eqBands, setEqBands] = useState<api.protobuf.eq.IBandResponse[]>([]);

  useEffect(() => {
    getEqBands(client, (item) => {
      setEqBands(item.bands);
    }, (err) => {
      console.error('getEqBands:err', err);
    });
  }, []);

  const onChangeGain = (index: number, gain: number) => {
    new Promise((resolve, reject) => {
      updateEqBand(api.protobuf.eq.BandIdent.create({ index, gain }), client, resolve, reject);
    })
  }

  return (
    <div>
      {eqBands.map(eqBand => (
        <div key={`band-${eqBand.index}`} style={{ border: "1px solid black" }}>
          <p>Index : {eqBand.index}</p>
          <p>Gain : {eqBand.gain}</p>
          <button onClick={() => onChangeGain(eqBand.index ?? 0, 0)}>Min</button>
          <button onClick={() => onChangeGain(eqBand.index ?? 0, 100)}>Max</button>
          <input type="range" value={eqBand.gain ?? 0} min={0} max={100} onChange={(event) => onChangeGain(eqBand.index ?? 0, Number(event.target.value))} />
        </div>
      ))}
    </div>
  )
};

export default EqPage;
