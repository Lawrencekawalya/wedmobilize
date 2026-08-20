<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LegalPagesTest extends TestCase
{
    public function test_legal_pages_are_publicly_accessible(): void
    {
        $pages = [
            'terms' => 'legal/terms',
            'privacy' => 'legal/privacy',
            'acceptable-use' => 'legal/acceptable-use',
        ];

        foreach ($pages as $route => $component) {
            $this->get(route($route))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page->component($component));
        }
    }
}
