function showErrorDialog(message, parentElement, classListD, classListP) {
    let dialog = parentElement.querySelector('#buttons dialog');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.classList.add(...classListD);
        parentElement.appendChild(dialog);
        
        const p = document.createElement('p'); p.classList.add(...classListP);p.textContent=message;
        
        dialog.appendChild(p);
        parentElement.appendChild(dialog);
    }
    else{
        dialog.querySelector('p').textContent=message;
    }
    dialog.showModal();
    setTimeout(() => dialog.close(), 2000);

}

document.addEventListener('DOMContentLoaded', ()=>{

    const addNewB = document.querySelector('#add-new');
    const articlesList = document.getElementById('articles-list');
    const updateButton = document.getElementById('update');
    const addButton = document.getElementById('add-new');
    const deleteInput = document.getElementById('delete');
    const deleteButton = document.getElementById('delete-btn');
    const bChangeTheme = document.querySelector('#theme');

   async function updateArticles(){
        fetch('http://localhost:3000/articles')
            .then(response=> response.json())
            .then(data => {
                articlesList.innerHTML='';
                data.articles.forEach(article => {
                   const li = document.createElement('li');
                   const [p1,p2,p3] = [document.createElement('p'),document.createElement('p'),document.createElement('p')]
                   const [span1, span2] = [document.createElement('span'),document.createElement('span')];
                   
                   li.dataset.id=article.id;
                
                   span1.classList.add('white'); span2.classList.add('white');
                   span1.textContent=article.title
                   span2.textContent=article.description;
                   
                   p1.textContent=`Id: ${article.id}`;
                   
                   p2.textContent='Title: ';p2.appendChild(span1);
                   p3.textContent='Description: '; p3.appendChild(span2);
                   li.append(p1,p2,p3);
                   articlesList.append(li);
                   
               });
                  
            });
    }

    async function addNewElements() {
        if(this.dataset.option === 'create'){
            this.textContent='Удалить окно с созданием новой статьи';
            this.dataset.option='delete';

            const menuButtons = document.getElementById('buttons');
            const divNewArticle = document.createElement('div');
            const formNewArticle = document.createElement('form');
            const h1 = document.createElement('h1');
            const [divTitle, divDescription] = [document.createElement('div'), document.createElement('div')];
            const [pTitle, pDescription] = [document.createElement('p'), document.createElement('p')];
            const [areaTitle, areaDescription] = [document.createElement('textarea'), document.createElement('textarea')];
            const buttonSend = document.createElement('button');
            
            divNewArticle.classList.add('center-content');
            divNewArticle.id='window-create-new-article';
            
            h1.textContent='Новая статья';
            h1.classList.add('white');
            formNewArticle.appendChild(h1);

            pTitle.textContent='Title';
            pTitle.classList.add('green');
            areaTitle.placeholder='Название статьи';
            areaTitle.id='title'
            divTitle.append(pTitle, areaTitle);
            

            pDescription.textContent='Description';
            areaDescription.placeholder='Текст статьи';
            areaDescription.id='description'
            pDescription.classList.add('green')
            
            divDescription.append(pDescription, areaDescription);
            
            buttonSend.textContent='Send';
            buttonSend.type='submit';
            divNewArticle.appendChild(formNewArticle);
            formNewArticle.append(divTitle, divDescription, buttonSend);
            menuButtons.insertAdjacentElement('afterend', divNewArticle);

            formNewArticle.addEventListener('submit', async(event)=>{
                event.preventDefault();
                const title = event.target[0].value;
                const description = event.target[1].value;
                const errorDiv = document.querySelector('#errorM');


                if(!title || !description) return;
                
                fetch('http://localhost:3000/articles', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({title, description})
                })
                .then(response => {
                    if(response.ok){
                        const windowNewArticle = document.querySelector('#window-create-new-article');
                        windowNewArticle.remove();
                        updateArticles();
                        addButton.textContent='Создать новую статью';
                        addButton.dataset.option='create';
                    }
                    else{
                        if(!errorDiv){
                            const errorDiv = document.createElement('div');
                            const errorP = document.createElement('p');
                            errorDiv.classList.add('margin-top-20','error', 'center-content');
                            errorDiv.id='errorM';
                            
                            response.json().then(res=>{errorP.textContent=JSON.stringify(res[0].message), null, 2});
                            errorP.classList.add('yellow');
                            
                            errorDiv.appendChild(errorP);
                            const windowNewArticle = document.querySelector('#window-create-new-article');
                            windowNewArticle.appendChild(errorDiv);
                        }
                        else{
                            response.json().then(res=>{errorDiv.querySelector('p').textContent=JSON.stringify(res[0].message), null, 2});
                        }

                    }
                })
            })
        
        }
        else{
            this.textContent='Создать новую статью';
            this.dataset.option='create';
            const windowNewArticle = document.querySelector('#window-create-new-article');
            if(windowNewArticle){
                windowNewArticle.remove();
            }
        }
    };

    async function deleteArticle() {
        if(!deleteInput) return;

        if(deleteInput.validationMessage){
            const dialog = document.querySelector('#buttons dialog');
            const menuButtons = document.getElementById('buttons');
            showErrorDialog(deleteInput.validationMessage, menuButtons, ['error', 'fixed-top'], ['justify', 's-30']);
            return;
        }
        
        fetch(`http://localhost:3000/articles/${deleteInput.value}`,{
            method: 'DELETE',
        })
        .then(response =>{
            if(response.ok){
                deleteInput.value='';
                updateArticles();
            }
            else{
                const dialog = document.querySelector('#buttons dialog');
                if (!dialog){
                    const dialog = document.createElement('dialog');
                    const errP = document.createElement('p');
                    const menuButtons = document.getElementById('buttons');
                    
                    dialog.classList.add('error', 'fixed-top');
                    errP.classList.add('justify', 's-30');
                    response.json().then(res => {
                        if(res.article===null){
                            errP.textContent='Такой статьи нет';
                        }
                        else{
                            errP.textContent=JSON.stringify(res, null, 2)
                        }
                        
                    });

                    dialog.appendChild(errP);
                    menuButtons.appendChild(dialog);
                    
                    dialog.showModal();
                    setTimeout  (()=>{dialog.close()}, 2000);
                }
                else{
                    response.json().then(res => {
                        if(res.article===null){
                            document.querySelector('dialog p').textContent='Такой статьи нет'
                            dialog.showModal();
                            setTimeout(()=>{dialog.close()}, 2000);
                        }
                        else{
                            document.querySelector('dialog p').textContent=JSON.stringify(res, null, 2)
                            dialog.showModal();
                            setTimeout(()=>{dialog.close()}, 2000);
                        }
                    })
                        
            }
        }
        })
    };

    async function changeTheme() {
        document.body.className=this.dataset.theme;
        this.textContent=this.dataset.theme=='white-theme'?'Тёмная тема':'Светлая тема';
        this.dataset.theme = this.dataset.theme=='white-theme'?'dark-theme':'white-theme'
    }


    updateButton.addEventListener('click', updateArticles);
    addNewB.addEventListener('click', addNewElements);
    deleteButton.addEventListener('click', deleteArticle);
    bChangeTheme.addEventListener('click', changeTheme);

})
