(function ($) {
    let host = "https://watchcovout-api.herokuapp.com";
    $(document).ready(function () {
        // validate or deny a user
        $.get(host + "/api/v0/users/", function (data, status) {
        
            function checkInvalide(element) {
                return !element.valide;
            }

            let invalideUsers = data.filter(checkInvalide);

            
            invalideUsers.forEach((element) => {
                
                $("#validation-grid").append(`
                
                <div class="col-md-4" id="user-${element.uid}">
                    <div class="card">
                        <img class="card-img-top" height="170px" src="${element.nationalCardPicURL}" alt="Card image cap">
                        <div class="card-body">
                            <h4 class="card-title mb-3">${element.nid}</h4>
                           
                            <div class="row justify-content-center mt-5" >
                                <button type="button" onclick="makeUserValide(${element.nid},'${element.uid}')" class="btn btn-success btn-lg">Valider</button>
                                <button type="button" onclick="makeUserInvalide(${element.nid},'${element.uid}')" class="btn btn-danger btn-lg ml-3">Refuser</button>
                            </div>
                        </div>
                    </div>

                </div>        
                `);
            });
        });




    
    //     var makeUserValide = (userNid ,valide)=>{
    //         $.post(`${host}/api/v0/users/validate/${userNid}?valide=${valide}`, function (data, status) {
    //             console.log('flutter is no bad at all')
    //             console.log(data)
    //         })
        
    //     }
    



    });


    

})(jQuery);
