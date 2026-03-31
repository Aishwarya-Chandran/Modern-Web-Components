 let lastIndex = 0;


    function moveIndicator(element, index) {
    const indicator = document.getElementById('indicator');
    const items = document.querySelectorAll('.icon-btn');
    
    const itemWidth = 52; 
    const itemGap = 16;   
    const paddingLeft = 28; 

    const isMovingForward = index > lastIndex;
    const distance = Math.abs(index - lastIndex);
    const targetLeft = paddingLeft + (index * (itemWidth + itemGap));
    
    const stretchWidth = itemWidth + (distance * (itemWidth + itemGap));

   
    if (isMovingForward) {
        
        indicator.style.width = `${stretchWidth}px`;
    } else {
        
        indicator.style.left = `${targetLeft}px`;
        indicator.style.width = `${stretchWidth}px`;
    }

    
    setTimeout(() => {
        indicator.style.width = `${itemWidth}px`;
        if (isMovingForward) {
            indicator.style.left = `${targetLeft}px`;
        }
    }, 150); 

    items.forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    lastIndex = index;
}
window.addEventListener('load', () => {
    const activeItem = document.querySelector('.icon-btn.active');
    const indicator = document.getElementById('indicator');
    
    if (activeItem && indicator) {
        
        indicator.classList.add('no-transition');
        
        
        const index = Array.from(activeItem.parentNode.children).indexOf(activeItem) - 1; 
        
       
        const itemWidth = 52; 
        const itemGap = 16;   
        const paddingLeft = 28; 
        const targetLeft = paddingLeft + (index * (itemWidth + itemGap));
        
        indicator.style.left = `${targetLeft}px`;
        indicator.style.width = `${itemWidth}px`;

        
        void indicator.offsetWidth; 
        indicator.classList.remove('no-transition');
        
        lastIndex = index;
    }
});