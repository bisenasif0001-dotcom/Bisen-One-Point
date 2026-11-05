import React, { useId } from 'react';
import { DUA_POSTERS } from '../data/duaPosters';

function Card({ x = 115, y = 180, scale = 1, rotate = 7, shadow }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate} 250 150) scale(${scale})`} filter={`url(#${shadow})`}>
    <rect width="500" height="305" rx="18" fill="#304f41" /><rect x="15" y="15" width="470" height="275" rx="10" fill="none" stroke="#b6b78b" strokeOpacity=".45" />
    <text x="35" y="53" fill="#eee9d4" fontFamily="Arial,sans-serif" fontSize="13" letterSpacing="2">AL-NOOR / PRINT STUDIO</text>
    <text x="35" y="135" fill="#fff5dc" fontFamily="Georgia,serif" fontSize="49">Made to</text><text x="35" y="191" fill="#fff5dc" fontFamily="Georgia,serif" fontStyle="italic" fontSize="51">belong.</text>
    <circle cx="408" cy="149" r="40" stroke="#c0b27b" fill="none" /><path d="M390 150h35m-13-13 13 13-13 13" stroke="#e5d6ae" strokeWidth="2" fill="none" />
    <text x="35" y="268" fill="#d4d9bf" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="2">MEMBERSHIP / 001</text><text x="431" y="268" fill="#d4d9bf" fontFamily="Arial,sans-serif" fontSize="9">STUDIO</text>
  </g>;
}

function Poster({ x = 115, y = 40, scale = 1, rotate = -7, shadow }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate} 150 210) scale(${scale})`} filter={`url(#${shadow})`}><rect width="300" height="425" fill="#b87c5c" /><path d="M35 220V130a115 115 0 0 1 230 0v90" fill="none" stroke="#d7ad83" strokeWidth="28" opacity=".65" /><text x="24" y="37" fill="#fff1d5" fontFamily="Arial,sans-serif" fontSize="9" letterSpacing="1">AL-NOOR / CREATIVE STUDIO</text><text x="25" y="262" fontFamily="Georgia,serif" fill="#fff3d8" fontSize="45">Make your</text><text x="25" y="315" fontFamily="Georgia,serif" fontStyle="italic" fill="#fff3d8" fontSize="49">mark.</text><text x="25" y="393" fontFamily="Arial,sans-serif" fill="#fff3d8" fontSize="8" letterSpacing="1.3">YOUR NEXT IDEA. BEAUTIFULLY PRINTED.</text></g>;
}

function Photo({ x, y, width = 220, height = 295, rotate = 0, subject = 'couple', shadow, note = false }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate} ${width / 2} ${height / 2})`} filter={`url(#${shadow})`}><rect width={width} height={height} fill="#fffdf6" /><svg x="13" y="13" width={width - 26} height={height - (note ? 66 : 35)} viewBox="0 0 434 620" preserveAspectRatio="xMidYMid slice" overflow="hidden"><image href={`/hero/wedding-${subject}.jpg`} width="434" height="724" /></svg>{note && <text x={width / 2} y={height - 22} textAnchor="middle" fill="#8e7753" fontFamily="Georgia,serif" fontStyle="italic" fontSize="19">the little things.</text>}</g>;
}

export default function PrintingServiceArt({ kind = 'studio', designId, decorative = false }) {
  const shadow = `print-shadow-${useId().replace(/:/g,'')}`;
  const poster = DUA_POSTERS.find(item => item.id === designId) || DUA_POSTERS.find(item => item.id === 'ayat-al-kursi');
  return <svg className={`prs-service-art prs-service-art-${kind}`} viewBox="0 0 720 540" xmlns="http://www.w3.org/2000/svg" role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : 'Illustrative presentation of printing services; final artwork is confirmed with the studio'}>
    <defs><filter id={shadow} x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="13" stdDeviation="11" floodColor="#223d2b" floodOpacity=".2" /></filter></defs>
    {kind === 'pvc' && <><g transform="translate(118 85) rotate(-8 240 140)" filter={`url(#${shadow})`}><rect width="480" height="285" rx="18" fill="#e5ddc8" /><path d="M35 52h140m-140 27h210m-210 32h110" stroke="#8e9c7a" strokeWidth="3" /><rect x="35" y="168" width="310" height="2" fill="#bdc3aa" /><text x="35" y="219" fontFamily="Arial,sans-serif" fontSize="11" fill="#82916c" letterSpacing="2">A LITTLE MORE PERSONAL.</text></g><Card shadow={shadow} /></>}
    {kind === 'posters' && <><Poster x={105} y={75} rotate={-10} scale={.9} shadow={shadow} /><Photo x={331} y={65} width={270} height={393} rotate={7} shadow={shadow} note /></>}
    {kind === 'dua' && <><g transform="translate(107 105) rotate(-8 120 165)" filter={`url(#${shadow})`}><rect width="245" height="347" fill="#fff" /><image href="/dua-posters/allah-will-suffice-you-in-everything-thumb.webp" x="9" y="9" width="227" height="329" preserveAspectRatio="xMidYMid meet" /></g><g transform="translate(317 40) rotate(6 145 210)" filter={`url(#${shadow})`}><rect width="288" height="410" fill="#fff" /><image href={poster.thumbnail} x="10" y="10" width="268" height="390" preserveAspectRatio="xMidYMid meet" /></g></>}
    {kind === 'bulk' && <><Photo x={88} y={132} rotate={-13} subject="bride" shadow={shadow} /><Photo x={407} y={132} rotate={11} subject="groom" shadow={shadow} /><Photo x={243} y={62} width={239} height={350} rotate={-2} shadow={shadow} note /></>}
    {kind === 'design' && <><Poster x={103} y={38} rotate={-8} shadow={shadow} /><Card x={281} y={190} scale={.65} rotate={9} shadow={shadow} /><g transform="translate(205 420) rotate(5)" filter={`url(#${shadow})`}><rect width="272" height="65" fill="#fffdf6" />{['#304f41','#bd805e','#c8b188','#e5e8d9','#5f7862'].map((colour,index)=><rect key={colour} x={12+index*50} y="12" width="44" height="41" fill={colour} />)}</g></>}
    {kind === 'studio' && <><Poster x={80} y={38} rotate={-9} shadow={shadow} /><Photo x={377} y={70} width={210} height={295} rotate={10} shadow={shadow} /><Card x={234} y={256} scale={.78} rotate={5} shadow={shadow} /></>}
  </svg>;
}
