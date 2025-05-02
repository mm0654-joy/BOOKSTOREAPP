const cds = require("@sap/cds");

module.exports = cds.service.impl((srv)=>{
    
    srv.before('CREATE', 'Books', async (req) => {
        
        console.log('Before Event Validation');

        let currentBookName = req.data.book_name;
        let dataPresent = await SELECT.from('amazon_Books').where({book_name:currentBookName});

        if (dataPresent.length > 0) {
            req.reject(500, 'Book is already present in db!');
        }
        
    });

    srv.on('CREATE', 'BooksAndAuthors', async (req) => {
        let data = req.data.book_id;
        let dataFromBTP = await SELECT.from('amazon_Books').where({book_id:data});
        let res = {
            book_id : dataFromBTP[0].BOOK_ID,
            book_name : dataFromBTP[0].BOOK_NAME,
            author_name : 'Joy Kishan',
        }
        req.reply(res);
    });

    srv.after('CREATE', 'Books', async (data, req) => {

        console.log("Entered After Event");
        let payloadForLogs = {
            "log_id": `LOG_${data.book_id}`,
            "log_message": `Book with name ${data.book_name} created successfully`
        }

        let bookLogs = await INSERT.into('amazon_Logs').entries(payloadForLogs);
        console.log(bookLogs);
        
    });

});