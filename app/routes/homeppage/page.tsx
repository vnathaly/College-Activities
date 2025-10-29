'use client'
 
import { useRouter } from 'next/navigation'

export default function homePpage () {
    const router = useRouter();
    const handletry = () => {
        router.push('./try')
    };
    return (
        <>
        <h1>This is the HomePage</h1>
        <button type="submit" onClick={handletry}>asndj</button>
        </>
        
    )
}
