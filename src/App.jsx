import React, { useState } from "react";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';

import Mermaid from "./components/Mermaid";

const App = () => {
  const [description, setDescription] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState("input");
  const [validationQuestions, setValidationQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [originalDescription, setOriginalDescription] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");

  const analyzeForDecisions = async (description) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze-decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const questions = data.questions || [];

      if (questions.length === 0) {
        await generateFlowchart(description, {});
      } else {
        setValidationQuestions(questions);
        setCurrentQuestionIndex(0);
        setCurrentStep("validation");
      }
    } catch (error) {
      console.error('Error analyzing decisions:', error);
      setError(`Error analyzing process: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerId) => {
    const currentQuestion = validationQuestions[currentQuestionIndex];
    
    if (answerId === "d" && currentQuestion.options.some(opt => opt.id === "d" && opt.text.includes("Other"))) {
      setShowCustomInput(true);
      return;
    }
    
    if (answerId === "custom") {
      if (!customInput.trim()) {
        setError("Please provide your custom answer.");
        return;
      }
      
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: `custom: ${customInput.trim()}`
      }));
      setCustomInput("");
      setShowCustomInput(false);
    } else {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answerId
      }));
      setShowCustomInput(false);
    }

    if (currentQuestionIndex < validationQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep("generating");
      generateFlowchart(originalDescription, userAnswers);
    }
  };

  const generateFlowchart = async (description, answers) => {
    setLoading(true);
    setError("");

    let enhancedDescription = description;
    if (Object.keys(answers).length > 0) {
      enhancedDescription += "\n\nUser clarifications:";
      Object.entries(answers).forEach(([questionId, answerId]) => {
        const question = validationQuestions.find(q => q.id === questionId);
        if (question) {
          if (answerId.startsWith('custom: ')) {
            const customAnswer = answerId.replace('custom: ', '');
            enhancedDescription += `\n- ${question.question}: ${customAnswer}`;
          } else {
            const answer = question.options.find(opt => opt.id === answerId);
            if (answer) {
              enhancedDescription += `\n- ${question.question}: ${answer.text}`;
            }
          }
        }
      });
    }

    const prompt = `You are an expert flowchart designer. Create a clear, professional Mermaid flowchart based on the process description and user clarifications.

Process with clarifications:
${enhancedDescription}

REQUIREMENTS:
1. Use clear, descriptive node labels WITHOUT special characters (no colons, dashes, or symbols in node names)
2. Keep node names simple and readable (use camelCase or simple words)
3. Include all decision points and their outcomes
4. Use proper Mermaid syntax with flowchart TD
5. Make the flow logical and easy to follow
6. Include all user clarifications in the appropriate decision points
7. Use simple node IDs like A, B, C or descriptive names without spaces
8. Avoid using colons, dashes, or special characters in node labels

EXAMPLE FORMAT:
flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E

Respond with only the Mermaid code, starting with \`\`\`mermaid and ending with \`\`\`.`;

    try {
      const response = await fetch("/api/generate-flowchart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          description: enhancedDescription,
          answers 
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Validate the generated code
      if (!data.mermaidCode || !data.mermaidCode.trim()) {
        throw new Error('Generated flowchart is empty. Please try again.');
      }

      setMermaidCode(data.mermaidCode);
      setCurrentStep("input");
    } catch (error) {
      console.error('Error generating flowchart:', error);
      setError(`Error generating flowchart: ${error.message}`);
      setCurrentStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlowchart = async () => {
    if (!description.trim()) {
      setError("Please enter a description first.");
      return;
    }

    setOriginalDescription(description);
    setUserAnswers({});
    setCustomInput("");
    setShowCustomInput(false);
    await analyzeForDecisions(description);
  };

  const handleAskFlowchart = async () => {
    setQaLoading(true);
    setQaError("");
    setQaAnswer("");
    
    try {
      const response = await fetch("/api/ask-flowchart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          mermaidCode: mermaidCode,
          question: qaQuestion 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setQaAnswer(data.answer);
    } catch (err) {
      setQaError("Failed to get answer. " + err.message);
    } finally {
      setQaLoading(false);
    }
  };

  const resetToInput = () => {
    setCurrentStep("input");
    setValidationQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setCustomInput("");
    setShowCustomInput(false);
    setError("");
  };

  const renderHeader = () => (
    <Box textAlign="center" mb={6}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        
        <Typography variant="h3" fontWeight={700} color="primary.main">
          FlowChart AI
        </Typography>
        
      </Stack>
      <Typography variant="h6" color="text.secondary" mt={2}>
        Transform your ideas into beautiful flowcharts with AI-powered decision validation
      </Typography>
    </Box>
  );

  const renderValidationStep = () => {
    if (validationQuestions.length === 0) return null;
    const currentQuestion = validationQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / validationQuestions.length) * 100;
    const hasOtherOption = currentQuestion.options.some(opt => opt.id === "d" && opt.text.includes("Other"));
    return (
      <Box maxWidth={1200} mx="auto">
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Decision Validation
            </Typography>
            <Typography color="text.secondary" mb={2}>
              I found some decision points that need clarification. Please help me understand your requirements better.
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8, borderRadius: 5 }} />
            <Typography variant="subtitle1" fontWeight={500} mb={2}>
              {currentQuestion.question}
            </Typography>
            <Stack spacing={2}>
              {currentQuestion.options.map((option) => (
                <Button
                  key={option.id}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => handleAnswer(option.id)}
                  sx={{ textAlign: 'left', justifyContent: 'flex-start', fontWeight: 500 }}
                >
                  {option.text}
                </Button>
              ))}
            </Stack>
            {showCustomInput && hasOtherOption && (
              <Box mt={3}>
                <TextField
                  label="Please specify your custom answer"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && customInput.trim() && handleAnswer("custom")}
                  fullWidth
                  autoFocus
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAnswer("custom")}
                  disabled={!customInput.trim()}
                >
                  Submit
                </Button>
              </Box>
            )}
          </CardContent>
          <CardActions>
            <Button startIcon={<ArrowBackIcon />} onClick={resetToInput} color="secondary">
              Back to input
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  };

  const renderInputStep = () => (
    <Box maxWidth={1200} mx="auto">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Describe Your Process
          </Typography>
          <Typography color="text.secondary" mb={2}>
            Tell me about your workflow, and I'll create a beautiful flowchart for you
          </Typography>
          <TextField
            label="Process Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., When a customer places an order, check inventory..."
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateFlowchart()}
          />
          <Button
            onClick={handleGenerateFlowchart}
            disabled={loading}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 1 }}
          >
            {loading ? "Analyzing..." : "Generate Flowchart"}
          </Button>
        </CardContent>
      </Card>
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      )}
      {mermaidCode && (
        <>
          <Box mt={4}>
            <Mermaid chart={mermaidCode} />
          </Box>
          <Box mt={2} maxWidth={1200} mx="auto">
            <Button
              variant="outlined"
              startIcon={<ExpandMoreIcon />}
              onClick={() => setQaOpen((open) => !open)}
              sx={{ mb: 2 }}
              fullWidth
            >
              Ask about this flowchart
            </Button>
            <Collapse in={qaOpen}>
              <Card variant="outlined" sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ask a question about this flowchart
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                  <TextField
                    label="Your question"
                    value={qaQuestion}
                    onChange={e => setQaQuestion(e.target.value)}
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={3}
                    disabled={qaLoading}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAskFlowchart}
                    disabled={!qaQuestion.trim() || qaLoading}
                    sx={{ minWidth: 120 }}
                  >
                    {qaLoading ? <CircularProgress size={24} /> : 'Ask'}
                  </Button>
                </Stack>
                {qaError && <Alert severity="error" sx={{ mt: 2 }}>{qaError}</Alert>}
                {qaAnswer && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Answer:</Typography>
                    <Typography variant="body1">{qaAnswer}</Typography>
                  </Alert>
                )}
              </Card>
            </Collapse>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {renderHeader()}
      {currentStep === "validation" ? renderValidationStep() : renderInputStep()}
    </Container>
  );
};

export default App;