// Optimized Exam Results Extractor Script
// Run this in your browser console on the exam results page

(async function extractExamData() {
    console.log('🚀 Starting exam data extraction...');
    
    // Use the testSummary object that's already in the page
    const testSummary = window.testSummary;
    
    if (!testSummary) {
        alert('❌ Could not find test data on this page. Make sure you\'re on the exam results page.');
        return null;
    }
    
    const examData = {
        examTitle: document.querySelector('.card-header.bg-dark h5 span')?.innerText || 'Unknown Exam',
        studentName: document.querySelector('.card-header.bg-dark h5 span:last-child')?.innerText || 'Unknown',
        testStartTime: document.getElementById('testStartTime')?.innerText || '',
        marksScored: document.getElementById('userMarks')?.innerText?.trim() || '',
        totalQuestions: document.getElementById('totalQuestions')?.innerText?.trim() || '',
        attemptedQuestions: document.getElementById('attemptedQuestions')?.innerText?.trim() || '',
        correctQuestions: document.getElementById('correctQuestions')?.innerText?.trim() || '',
        incorrectQuestions: document.getElementById('incorrectQuestions')?.innerText?.trim() || '',
        sections: []
    };
    
    console.log('📊 Exam Info:', examData.examTitle);
    console.log('👤 Student:', examData.studentName);
    console.log('📈 Score:', examData.marksScored);
    
    // Extract all sections
    const sections = document.querySelectorAll('.userScore.card.border-info.m-2');
    
    for (let section of sections) {
        const sectionName = section.querySelector('.userScore.card-header.bg-info span.pull-left')?.innerText?.trim() || '';
        const sectionMarks = section.querySelector('.badge.label-info:last-child')?.innerText || '';
        
        console.log(`\n📚 Processing Section ${sectionName}...`);
        
        const sectionData = {
            sectionName: sectionName,
            sectionMarks: sectionMarks,
            questions: []
        };
        
        // Get all question cards in this section
        const questionCards = section.querySelectorAll('.card.m-1');
        
        for (let card of questionCards) {
            const qNumber = card.querySelector('.col-1.col-lg-1.text-left.p-0')?.innerText?.trim();
            const marks = card.querySelector('.col-2.col-lg-2.text-center.p-0 span')?.innerText?.trim();
            
            // Skip if no question number (might be section header)
            if (!qNumber) continue;
            
            console.log(`  📝 Question ${qNumber} (${marks} marks)`);
            
            const questionData = {
                questionNumber: qNumber,
                marks: marks,
                questionText: '',
                evaluatorComments: '',
                answerScriptPageNumber: ''
            };
            
            // Get question text
            const questionTextDiv = card.querySelector('.questionText.ql-editor');
            if (questionTextDiv) {
                questionData.questionText = questionTextDiv.innerText.trim();
            }
            
            // Get evaluator comments
            const qid = card.querySelector('[id^="question-"]')?.getAttribute('data-qid');
            if (qid) {
                const commentsTextarea = document.getElementById(`comments-${qid}`);
                if (commentsTextarea) {
                    questionData.evaluatorComments = commentsTextarea.value;
                }
                
                // Get page number from answer script
                if (window.qidVsPageNum && window.qidVsPageNum[qid]) {
                    questionData.answerScriptPageNumber = window.qidVsPageNum[qid].join(', ');
                }
            }
            
            sectionData.questions.push(questionData);
        }
        
        examData.sections.push(sectionData);
        console.log(`✅ Section ${sectionName} complete (${sectionData.questions.length} questions)`);
    }
    
    console.log('\n🎉 Extraction complete!');
    console.log(`📊 Total sections: ${examData.sections.length}`);
    console.log(`📝 Total questions extracted: ${examData.sections.reduce((sum, s) => sum + s.questions.length, 0)}`);
    
    // Store in window for easy access
    window.examData = examData;
    
    // Convert to JSON
    const jsonData = JSON.stringify(examData, null, 2);
    
    // Try to copy to clipboard
    try {
        await navigator.clipboard.writeText(jsonData);
        console.log('\n✅ Data copied to clipboard! Paste it in the chat with Claude.');
        alert('✅ Exam data extracted successfully!\n\nThe data has been copied to your clipboard.\nGo back to your chat with Claude and paste it there.');
    } catch (err) {
        console.log('\n⚠️ Could not copy to clipboard automatically.');
        console.log('📋 Copy the data below:');
        console.log(jsonData);
        alert('⚠️ Data extraction complete!\n\nThe clipboard copy failed, but the data is in the console.\nYou can also type: copy(examData) to copy it manually.');
    }
    
    return examData;
})();
