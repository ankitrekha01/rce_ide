const express = require("express");
const fs = require('fs');
var path = require('path');
var expressLayouts = require("express-ejs-layouts")
var cp = require('child_process')

//Random-name-generator
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const { stderr, stdout } = require('process');

var app = express();

//middlewar for view engine
app.use(expressLayouts)
app.set('view engine','ejs')

//body-parser
app.use(express.urlencoded({extended:false}));

//Other way to output is we can make a .out file which will have output and then we can read it.
// command terminal command in all <input.txt> output.out

//variable
var output;

app.get("/",(req,res)=>{
    res.render("main",{output:output})
})

app.post('/code',(req,res)=>{
    var randomName = uniqueNamesGenerator({ dictionaries: [adjectives] });
    const code = req.body.code;
    const input = req.body.input;
    const lang = req.body.language;
    var fileExt;
    var fileInput;
    if(lang=="c++"){
        fileExt = randomName+".cpp"
        fileInput = randomName+"input.txt"
    }else if(lang =='python'){
        fileExt = randomName+".py"
        fileInput = randomName+"input.txt"
    }else if(lang =='java'){
        fileExt = "Main.java"
        fileInput = "Maininput.txt"
        randomName = "Main"
    }else if(lang == 'node'){
        fileExt = randomName+".js"
        fileInput = randomName+"input.txt"
    }

    fs.writeFile(fileExt,code,(err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("SucessFully file is been written")
            fs.writeFile(fileInput,input,(err)=>{
                if(lang=="c++"){
                    cp.exec(`g++ ${fileExt} -o ${randomName} && ${randomName} <${fileInput}`,{timeout:5000,maxBuffer:50000},(err,stdout,stderr)=>{
                        if(err){
                            console.log(err)
                            if(err.code == "ERR_CHILD_PROCESS_STDIO_MAXBUFFER"){
                                //When infinite loops is going on .exe file is still running, so we make a new terminal to kill it.
                                cp.exec(`Taskkill /F /IM ${randomName}.exe`,()=>{
                                    fs.unlink(randomName+".exe",(err)=>{
                                        if(err) console.log(err)
                                    })
                                })
                            }
                        }
                        if(stderr){
                            output = stderr;
                            res.redirect('/')           
                            fs.unlink(fileExt,(err)=>{
                                if(err) console.log(err);
                                fs.unlink(fileInput,(err)=>{
                                    if (err) console.log(err)
                                })
                            })
                        }else if(stdout){
                            output = stdout;
                            res.redirect("/");
                            fs.unlink(fileExt,(err)=>{
                                if(err) console.log(err);
                                fs.unlink(fileInput,(err)=>{
                                    if (err) console.log(err)
                                    fs.access(randomName+".exe",(err)=>{
                                        if(err) throw err;
                                        else{
                                            fs.unlink(randomName+".exe",(err)=>{
                                                if(err) console.log(err)
                                            })
                                        }
                                    })
                                })
                            })
                        }
                    })
                }
                else if(lang=="python"){
                    cp.exec(`python ${fileExt} <${fileInput}`,{timeout:10000,maxBuffer:50000},(err,stdout,stderr)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        if(stderr){
                            output =stderr;
                            res.redirect('/')
                            fs.unlink(fileExt,(err)=>{
                                if(err) throw err;
                                fs.unlink(fileInput,(err)=>{
                                    if(err) throw err;
                                })
                            })
                        }else{
                                output = stdout;
                                res.redirect('/')
                                fs.unlink(fileExt,(err)=>{
                                    if(err) throw err;
                                    fs.unlink(fileInput,(err)=>{
                                        if(err) throw err;
                                    })
                                })
                            
                        }
                    })
                }
                else if(lang=='java'){
                    cp.exec(`javac Main.java && java Main <Maininput.txt`,{timeout:10000,maxBuffer:50000},(err,stdout,stderr)=>{
                        if(stderr){
                            output =stderr;
                            res.redirect('/')
                            fs.unlink(fileExt,(err)=>{
                                if(err) throw err;
                                fs.unlink(fileInput,(err)=>{
                                    if(err) throw err;
                                    fs.access("Main.class",(err)=>{
                                        if(err) throw err;
                                        else{
                                            fs.unlink("Main.class",(err)=>{
                                                if(err) throw err;
                                            })
                                        }
                                    })
                                })
                            })
                        }else{
                                output = stdout;
                                res.redirect('/')
                                fs.unlink(fileExt,(err)=>{
                                    if(err) throw err;
                                    fs.unlink(fileInput,(err)=>{
                                        if(err) throw err;
                                            fs.unlink(randomName+".class",(err)=>{
                                                if (err) throw err;
                                                console.log("all files deleted")
                                        })
                                    })
                                })
                        }
                    })
                }
                else if(lang=="node"){
                    cp.exec(`node ${fileExt} ${fileInput}`,{timeout:10000,maxBuffer:50000},(err,stdout,stderr)=>{
                        if(err){
                            console.log(err)
                        }
                        if(stderr){
                            console.log(stderr)
                            output = stderr;
                            res.redirect('/')
                            fs.unlink(fileExt,(err)=>{
                                if(err) throw err;
                                fs.unlink(fileInput,(err)=>{
                                    if(err) throw err;
                                })
                            })
                        }else{
                                output = stdout;
                                res.redirect('/')
                                fs.unlink(fileExt,(err)=>{
                                    if(err) throw err;
                                    fs.unlink(fileInput,(err)=>{
                                        if(err) throw err;
                                    })
                                })
                        }
                    })
                }
            })
        }
    })
})
//Error Handling
app.use((req,res,next)=>{
    const error = new Error("Not Found");
    error.status = 404
    next(error);
})
//If the above makes and error then this runs 
app.use((error,req,res,next)=>{
    res.status(error.status||500);
    res.json({
        error:error.message
    })
})


const PORT = 4000;
app.listen(PORT,()=>{
    console.log("Server is running on "+PORT);
})