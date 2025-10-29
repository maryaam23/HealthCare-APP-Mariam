import { useState } from "react";
import api from "../api";

export default function Finance({ token }) {
    const [search,setSearch] = useState({});
    const [results,setResults]=useState([]);

    const doSearch = async ()=>{
        const res = await api.get("/finance/search",{params:search, headers:{Authorization:token}});
        setResults(res.data);
    }

    return (
        <div>
            <input placeholder="Doctor Name" onChange={e=>setSearch({...search,doctorName:e.target.value})} />
            <input placeholder="Patient Name" onChange={e=>setSearch({...search,patientName:e.target.value})} />
            <input placeholder="Visit ID" onChange={e=>setSearch({...search,visitId:e.target.value})} />
            <button onClick={doSearch}>Search</button>
            <pre>{JSON.stringify(results,null,2)}</pre>
        </div>
    );
}
