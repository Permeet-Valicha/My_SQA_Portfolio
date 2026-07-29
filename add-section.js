const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const metricsSection = `
    <!-- Professional Metrics Section -->
    <section class="py-14 bg-surface blueprint-grid relative overflow-hidden" id="metrics" aria-label="Professional Metrics">
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div class="circuit-line horizontal top-[30%]"></div>
            <div class="circuit-line horizontal top-[70%] animation-delay-2"></div>
            <div class="circuit-line vertical left-[15%]"></div>
            <div class="circuit-line vertical right-[15%] animation-delay-3"></div>
        <div class="editorial-margin relative z-10">
            <div class="text-center max-w-2xl mx-auto mb-10 reveal">
                <h3 class="text-label text-primary font-bold tracking-[0.2em] uppercase mb-3">Impact at a Glance</h3>
                <h2 class="text-4xl font-headline font-bold text-on-surface">Professional Metrics</h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 reveal" style="transition-delay: 200ms;">
                <div class="stats-card text-center" aria-label="Years of Experience">
                    <div class="text-3xl font-black text-primary counter" data-target="2" data-suffix="+">0</div>
                    <div class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Years<br>Experience</div>
                <div class="stats-card text-center" aria-label="Test Cases Executed">
                    <div class="text-3xl font-black text-primary counter" data-target="500" data-suffix="+">0</div>
                    <div class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Test<br>Cases</div>
                <div class="stats-card text-center" aria-label="Bugs Reported">
                    <div class="text-3xl font-black text-primary counter" data-target="150" data-suffix="+">0</div>
                    <div class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Bugs<br>Reported</div>
                <div class="stats-card text-center" aria-label="Products Tested">
                    <div class="text-3xl font-black text-primary counter" data-target="10" data-suffix="+">0</div>
                    <div class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Products<br>Tested</div>
                <div class="stats-card text-center" aria-label="APIs Tested">
                    <div class="text-3xl font-black text-primary counter" data-target="50" data-suffix="+">0</div>
                    <div class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">APIs<br>Tested</div>
                <div class="stats-card text-center" aria-label="Regression Cycles">
                    <div class="text-3xl font-black text-primary counter" data-target="30" data-suffix="+">0</div>
                    <div class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Regression<br>Cycles</div>
                <div class="stats-card text-center" aria-label="Production Releases">
                    <div class="text-3xl font-black text-primary counter" data-target="20" data-suffix="+">0</div>
                    <div class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">Releases<br>Supported</div>
            </div>
    </section>

    <!-- About Section -->`;

html = html.replace('<!-- About Section -->', metricsSection);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Done - Professional Metrics section added successfully');
