require('dotenv').config()
const { OpenAI } = require('langchain/llms/openai')
const inquirer = require('inquirer')
const { PromptTemplate } = require('langchain/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers')

const model = new OpenAI({ 
    openAIApiKey: process.env.OPENAI_API_KEY, 
    temperature: 0,
    model: 'gpt-3.5-turbo'
  });

  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    details: "list publishing details about the book including but not limited to publishing date, length, editions and publisher",
    summary: "detailed summary of the plot of the book",
    themes: "list the theme or themes of the book",
    suggestedBooks: "list additional books that the user could read if they like this book"
});

const formatInstructions = parser.getFormatInstructions()

const prompt = new PromptTemplate({
    template: "You are a literature Professor summarizing books requested by a student. You will recieve an author and title and provide publishing details, summary and a list of themes discussed in the book and suggest other books that the user could read if they enjoy the book they requested. \n {format_instructions} \n {author} {title}",
    inputVariables: ["author", "title"],
    partialVariables: { format_instructions: formatInstructions },
})

const promptFunc = async (input) => {
    try{

        const promptInput = await prompt.format({
            author: input.author.trim(),
            title: input.title.trim()
        })

        const res = await model.call(promptInput)
        const parsedResults = await parser.parse(res)

        console.log(parsedResults)
    }catch(err){
        console.error(err)
    }
}

const init = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "author",
            message: "Who is the author of the book you would like summarized?"
        },
        {
            type: "input",
            name: "title",
            message: "What is the title of the book you would like summarized?"
        }
    ]).then((res)=> {
        promptFunc({...res})
    })
}

init()