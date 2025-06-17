"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, X, Lightbulb } from "lucide-react"

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const tourSteps = [
  {
    title: "Welcome to Figma2React!",
    description: "Let's take a quick tour of the features that will help you convert Figma designs to React components.",
    target: null,
  },
  {
    title: "Figma Import",
    description: "Start by pasting your Figma URL here. Our AI will automatically analyze and convert your design.",
    target: "[data-tour='figma-url-input']",
  },
  {
    title: "AI Generator",
    description: "Alternatively, describe your component in natural language and let AI create it for you.",
    target: null,
  },
  {
    title: "You're Ready!",
    description: "That's it! You're now ready to start converting Figma designs to React components.",
    target: null,
  },
]

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = tourSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <Badge variant="secondary">
                {currentStep + 1} / {tourSteps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}