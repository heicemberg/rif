'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  items?: FAQItem[];
  className?: string;
  title?: string;
  description?: string;
}

const defaultFAQItems: FAQItem[] = [
  {
    question: 'How do the prize draws work?',
    answer: 'Our prize draws use a certified random selection system. Each entry receives a unique number, and winners are selected randomly when the draw closes. All draws are conducted transparently and results are published immediately.',
    category: 'General'
  },
  {
    question: 'Is it really free to enter?',
    answer: 'Yes! Basic entry is completely free. You get one free entry per draw. You can earn additional entries by completing actions like sharing on social media or referring friends. Premium entry packages are also available for purchase.',
    category: 'Pricing'
  },
  {
    question: 'How are winners notified?',
    answer: 'Winners are notified via email and SMS within 24 hours of the draw. You\'ll also see a notification in your account dashboard. Winners have 7 days to claim their prize.',
    category: 'Winners'
  },
  {
    question: 'When will I receive my prize?',
    answer: 'Digital prizes are delivered instantly via email. Physical prizes are shipped within 5-7 business days after verification. Shipping times vary by location but typically take 1-3 weeks.',
    category: 'Prizes'
  },
  {
    question: 'Can I enter multiple times?',
    answer: 'Yes! While you get one free entry per draw, you can earn or purchase additional entries. More entries mean better chances of winning. There\'s no limit to how many entries you can have.',
    category: 'General'
  },
  {
    question: 'Which countries are eligible?',
    answer: 'We currently accept entries from the United States, Canada, United Kingdom, Australia, and most EU countries. Check the specific draw rules as some prizes may have geographic restrictions.',
    category: 'Eligibility'
  },
  {
    question: 'Are the prizes real?',
    answer: 'Absolutely! All prizes are 100% genuine and come from authorized retailers. We have partnerships with major brands and all prizes include full manufacturer warranties where applicable.',
    category: 'Prizes'
  },
  {
    question: 'What happens if I don\'t claim my prize?',
    answer: 'Winners have 7 days to claim their prize. If unclaimed, we conduct a redraw and select an alternate winner. Make sure to check your email regularly and keep your contact information updated.',
    category: 'Winners'
  }
];

export function FAQ({
  items = defaultFAQItems,
  className,
  title = 'Frequently Asked Questions',
  description = 'Everything you need to know about winning amazing prizes'
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = ['All', ...new Set(items.map(item => item.category).filter((cat): cat is string => Boolean(cat)))];
  
  // Filter items by category
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredItems.map((item, index) => (
            <Card 
              key={index}
              className="overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                aria-expanded={openIndex === index}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium pr-8">{item.question}</h3>
                  <div className={cn(
                    'flex-shrink-0 ml-2 transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}>
                    <svg 
                      className="w-5 h-5 text-muted-foreground" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </div>
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                  {item.category && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        Category: {item.category}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="max-w-3xl mx-auto mt-12 p-8 text-center bg-primary/5 border-primary/20">
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our support team is available 24/7 to help you
          </p>
          <div className="flex gap-4 justify-center">
            <Button>
              Contact Support
            </Button>
            <Button variant="outline">
              Live Chat
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}