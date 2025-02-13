document.addEventListener("DOMContentLoaded",()=>{
    const themeToggle=document.getElementById("theme-toggle");
    const themeSelector=document.getElementById("theme-selector");
    const currentTheme=localStorage.getItem("theme");

    if(currentTheme){
        document.body.classList.add(currentTheme);
        themeSelector.value=currentTheme;
    }

    themeToggle.addEventListener("click",()=>{
        document.body.classList.toggle("dark-mode");

        if(document.body.classList.contains("dark-mode")){
            localStorage.setItem("theme","dark-mode");
        }else{
            localStorage.removeItem("theme");
        }
    });

    themeSelector.addEventListener("change",(e)=>{
        document.body.classList.remove("blue-theme","red-theme","green-theme");

        const selectedTheme=e.target.value;

        if(selectedTheme!== "default"){
            document.body.classList.add(selectedTheme);
            localStorage.setItem("theme",selectedTheme);
        }else{
            localStorage.removeItem("theme");
        }
    });
});