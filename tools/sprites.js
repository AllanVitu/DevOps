/* ==========================================================================
   SPRITES.JS — Small original pixel-art sprites, drawn as text.

   Each sprite is a list of rows; every character is one pixel, looked up in
   `colors` ('.' is transparent). build.js turns them into crisp inline SVG
   (one <rect> per run of same-coloured pixels), used as floating
   "ingredients" on the apps page.
   ========================================================================== */

module.exports = {
    heart: {
        colors: { R: '#ff4766', W: '#ffd3dc', D: '#c21d3f' },
        rows: [
            '.RR.RR.',
            'RWRRRRR',
            'RRRRRRR',
            'DRRRRRD',
            '.DRRRD.',
            '..DRD..',
            '...D...',
        ],
    },
    gem: {
        colors: { L: '#8ff5ff', W: '#ffffff', D: '#1fb8cc', S: '#127f8f' },
        rows: [
            '..LLLL..',
            '.LWLLLL.',
            'LWLLLLLL',
            'DDDDDDDD',
            '.DDDDDS.',
            '..DDDS..',
            '...DS...',
        ],
    },
    /* The TheEclipseCraft motif: Minecraft's square sun, half hidden by a
       square moon with a glowing rim. */
    eclipse: {
        colors: { Y: '#ffc53d', W: '#fff2b3', O: '#ff8a3d', M: '#1d1238' },
        rows: [
            '....OOOOOO',
            '....OMMMMO',
            'YYYYOMMMMO',
            'YWYYOMMMMO',
            'YYYYOMMMMO',
            'YYYYOOOOOO',
            'YYYYYYYY..',
            'YYYYYYYY..',
            'YYYYYYYY..',
            'YYYYYYYY..',
        ],
    },
    grass: {
        colors: { G: '#5cc23a', g: '#8be05e', D: '#8a5a2f', d: '#6a4322' },
        rows: [
            'GGGGGGGG',
            'GgGGGgGG',
            'GDGgDGGD',
            'DDdDDDDd',
            'DdDDDdDD',
            'DDDDdDDD',
            'DdDDDDdD',
            'DDDdDDDD',
        ],
    },
    orb: {
        colors: { G: '#b8f34a', W: '#f3ffc9', g: '#6fae1e' },
        rows: [
            '.GGGG.',
            'GWWGGG',
            'GWGGGg',
            'GGGGGg',
            'GGGGgg',
            '.gggg.',
        ],
    },
    star: {
        colors: { W: '#ffffff', Y: '#ffe066' },
        rows: [
            '...W...',
            '...Y...',
            '..YWY..',
            'WYWWWYW',
            '..YWY..',
            '...Y...',
            '...W...',
        ],
    },
};
