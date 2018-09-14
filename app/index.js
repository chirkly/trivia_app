class Quiz {
    constructor(){
        this.questions = {};
        this.currQuestionIndex = 0;
        this.currAnswer = "";
        this.allAnswers = [];
        this.numberOfQuestions = 3;
    }

    get answer() {
        return this.currAnswer;
    }

    initiateQuiz() {
        this.questions = {};
        this.currQuestionIndex = 0;
        this.currAnswer = "";
        this.allAnswers = [];
        let quizFetch = new Promise(
            (resolve, reject) => {
                 fetch('https://opentdb.com/api.php?amount=' + this.numberOfQuestions)
                    .then(
                        (response) => {
                            if(response.ok){
                                return response.json();
                            } 
                            throw new Error('Bad response')
                        }
                    )
                    .then(
                        (jsonQuestions) => {
                            if(jsonQuestions.results.length > 0){
                                this.questions = jsonQuestions.results;
                                resolve(this.getNextQuestion());
                            } else {
                                throw new Error('No questions returned')
                            }
                        }
                    )
                    .catch(
                        (error) => {
                            reject(['Error', error]);
                        }
                    )
            }
        );
        return quizFetch;
    }

    getNextQuestion() {
        let lastQuestion = false;
        if(this.currQuestionIndex < this.numberOfQuestions){
            const currQuestionItem = this.questions[this.currQuestionIndex];
            this.currAnswer = currQuestionItem.correct_answer;
            const allAnswers = this.buildAnswers(currQuestionItem.type, currQuestionItem.incorrect_answers);
            this.currQuestionIndex++;
            lastQuestion = (this.currQuestionIndex === this.numberOfQuestions)
            return [currQuestionItem.question, allAnswers, lastQuestion];
        }
        return ['End Of Quiz'];
    }

    buildAnswers(questionType, answers){
        let fullAnswers = [];
        questionType === 'boolean'? 
            fullAnswers = ['True', 'False']:
            fullAnswers = this.randomizeAnswers(answers);
        return fullAnswers;
    }

    randomizeAnswers(answerArray){
        answerArray.push(this.currAnswer);
        const n = answerArray.length;
        const tmpArr = [];
        for ( var i = 0; i < n-1; i++ ) {
            tmpArr.push(answerArray.splice(Math.floor(Math.random()*answerArray.length),1)[0]);
        }
        tmpArr.push(answerArray[0]);
        return tmpArr;
    }
}

const newQuiz = new Quiz();
const startButton = document.getElementById('startBtn');
const submitAnswerButton = document.getElementById('submitAnswer');
const nextQuestionButton = document.getElementById('nextQuestion');
let score = 0;
const scoreIncrement = 10;


startButton.addEventListener('click', startNewGame);
submitAnswerButton.addEventListener('click', submitAnswer);
nextQuestionButton.addEventListener('click',presentNextQuestion);
document.getElementById('newGameLink').addEventListener('click', startNewGame);

function startNewGame() {
    startButton.removeEventListener('click', startNewGame);
    const quizInfo = newQuiz.initiateQuiz();
    quizInfo.then( (value) => {
        startButton.style.display = "none";
        setScore(0);
        populateQuizQuestion(value);
    }).catch( () => {
        alert('There was an error loading the quiz. Please try again later.');
        startButton.addEventListener('click', startNewGame);
    });
}

function populateQuizQuestion(quizInfo) {
    console.log(quizInfo[2]);
    let answerHtml = "";
    document.getElementById('questionText').innerHTML = quizInfo[0];
    quizInfo[1].forEach(function(element, index){
        answerHtml += '<div><input type="radio" id="ans' + index + '" name="answers" value="' + element +'"/>' +
                        '<label for="ans' + index +'">' + element + '</label></div>';
    });
    document.getElementById('answers').innerHTML = answerHtml;
    nextQuestionButton.style.display = "none";
    quizInfo[2] ? nextQuestionButton.innerHTML = 'Finish Quiz' : nextQuestionButton.innerHTML = 'Next Question';
    submitAnswerButton.disabled = false;
    document.getElementById('question').style.display = "unset";
}

function submitAnswer() {
    const answer = document.querySelector('input[name="answers"]:checked').value;
    if(answer !== 'undefined'){
        submitAnswerButton.disabled = true;
        processAnswer(answer);
        nextQuestionButton.style.display = "unset";
    } else {
        alert('Please select an answer first.')
    }
}

function processAnswer(answer) {
    if(answer === newQuiz.answer){
        setScore(scoreIncrement);
    } else {
        setScore(-scoreIncrement);
    }
    let answerItem = document.querySelectorAll('input[value="'+newQuiz.answer+'"]')[0].id;
    document.querySelectorAll('label[for="'+answerItem+'"]')[0].style.backgroundColor  = 'green';
}
function setScore(scoreChange){
    if(scoreChange === 0) {
        score = 0;
    } else {
        score = score + scoreChange
    }
    const scoreElements = Array.from(document.getElementsByClassName('score'));
    scoreElements.forEach(function(element){
        element.innerHTML = score;
    });
}
function presentNextQuestion() {
    const nextQuestion = newQuiz.getNextQuestion()
    if (nextQuestion[0] !== 'End Of Quiz') {
        populateQuizQuestion(nextQuestion);
    } else {
        finishGame();
    }
}
function finishGame() {
    document.getElementById('question').style.display = "none";
    if(score > 0) {
        document.getElementById('goodScore').style.display = "unset";
    } else {
        document.getElementById('badScore').style.display = "unset";
    }
    document.getElementById('final').style.display = "unset";
}