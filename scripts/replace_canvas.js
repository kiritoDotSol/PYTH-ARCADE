const fs = require('fs');
const file = 'src/components/GameCanvas.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all Math.random() with (prngRef.current ? prngRef.current() : Math.random())
content = content.replace(/Math\.random\(\)/g, '(prngRef.current ? prngRef.current() : Math.random())');

fs.writeFileSync(file, content);
console.log('Done replacing Math.random() in GameCanvas.tsx');
