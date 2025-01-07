Authors: Mattia Basaglia
no_nav: 1
disable_toc: 1


<style>
    .index-page {
        margin-top: 36px;
        margin-bottom: 200px;
    }
    .index-page a:hover{
        color: #00C1A2;
        text-decoration: none;
    }
    .index-card-header {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        padding: 24px 8px;
        gap: 24px;
        width: 1200px;
    }
    .index-card-header-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0px;
        gap: 16px;
        width: 768px;
    }
    .index-card-header-nav{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 20px;
        gap: 8px;
        width: 360px;
        background: #F3F6F8;
        border-radius: 16px;
        flex: none;
        order: 1;
        flex-grow: 0;
    }
    .index-page a {
        color: #20272C
    }
    .index-card-lg {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 16px;
        width: 588px;
        height: 200px;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #F3F6F8;
        cursor: pointer;
    }
    .index-card-sm {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 16px;
        width: 282px;
        left: 0px;
        top: 0px;
        border-radius: 12px;
        padding: 24px;
        border: 1px solid #F3F6F8;
        cursor: pointer;
    }
    .index-footer {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 24px;
        width: 100vw;
        height: 110px;
        border-top: 1px solid #F3F6F8;
        position: fixed;
        bottom: 0px;
        left: 0px;
        background: white;
    }
    .index-footer-content {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        padding: 10px;
        gap: 10px;
        width: 1200px;
    }
    .index-footer-content > p {
        font-family: 'Karla';
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 150%;
        letter-spacing: -0.02em;
        color: #63727E;
    }
    .index-topic-header {
        margin: 0
    }
    .index-card-lg:hover {
        border: 1px solid #D9E0E6;
    }
    .index-card-sm:hover {
        border: 1px solid #D9E0E6;
    }
    .index-container-top{
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        padding: 0px;
        gap: 24px;
        margin-top: 24px;
    }
    .index-card-header-content > h2 {
        margin: 0;
    }

    .lottie-button{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 4px 12px;
        gap: 8px;
        height: 32px;
        background: #F3F6F8;
        border-radius: 8px;
        border: 0;
        color: #20272C;
    }

    .lottie-button:hover {
        background: #D9E0E6;
    }

    .lottie-button:focus {
        background: #F3F6F8;
        /* focus-on-light */
        box-shadow: 0px 0px 0px 1px #FFFFFF, 0px 0px 0px 3px #00DDB3;
    }

    @media (max-width: 800px) {
        .index-card-header-nav {
            display: none;
        }
    }

    @media (max-height: 1200px) {
            .index-page {
                margin-bottom: 0px;
            }
            .index-footer {
            margin-top: 64px;
            margin-left: -16px;
            position: static;
        }
    }

    @media (max-width: 1200px) {
        .index-card-header{
            width: 100%;
        }
    }

    @media (max-width: 1000px) {
        .index-card-header {
            padding: 24px 0;
        }
        .index-container-top {
            flex-direction : column;
            padding: 0;
        }

        .index-card-lg {
            width: 100%;
            height: auto;
        }

        .index-card-sm {
            width: 100%;
            height: auto;
        }

        .index-footer {
            padding: 16px;
        }
        .index-page {
                margin-bottom: 0px;
            }
        .index-footer {
            margin-top: 64px;
            margin-left: -16px;
            position: static;
        }
    }
</style>

<script src="https://unpkg.com/@lottiefiles/lottie-player@1.5.7/dist/lottie-player.js"></script>
<div class="index-page">
    <div class="index-card-header">
        <div class="index-card-header-content">
            <lottie src="https://assets9.lottiefiles.com/private_files/lf30_smcmhowt.json" loop="true" buttons="false" background="none" />
            <h2>A human's guide to the Lottie format</h2>
            <p>Lottie is a vector animation format, using JSON to represent its data.</p>
            <p>
            This guide aims to provide a human-readable description of the format and how everything works within it.
            </p>
            <button class="lottie-button"  onclick="window.location='/lottie-docs/Introduction/'" style="font-weight: bold;">Read the guide<img src="/lottie-docs/img/icon-right-arrow.svg"/></button>
        </div>
        <div class="index-card-header-nav">
            <h5>Topics</h5>
            <ul>
                <li><a href="/lottie-docs/Introduction/">Introduction</a></li>
                <li><a href="/lottie-docs/breakdown/bouncy_ball/">Bouncy Ball</a></li>
                <li><a href="/lottie-docs/breakdown/lottie_from_scratch/">Lottie from Scratch</a></li>
                <li><a href="/lottie-docs/breakdown/bezier/">Bezier Curves </a></li>
                <li><a href="/lottie-docs/breakdown/precomps/">Precompositions</a></li>
                <li><a href="/lottie-docs/concepts/">Lottie Format</a></li>
                <li><a href="/lottie-docs/rendering/">Tips for Rendering</a></li>
                <li><a href="/lottie-docs/schema/">JSON Schema</a></li>
                <li><a href="/lottie-docs/advanced_interactions/">Advanced Interactions</a></li>
            </ul>
        </div>
    </div>
    <div class="index-container-top">
        <div class="index-card-lg" onclick="window.location='/lottie-docs/concepts/'">
            <h3 class="index-topic-header">Lottie Format</h3>
            <p>This page describes values and other objects used throughout the Lottie format.</p>
        </div>
        <div class="index-card-lg">
            <h3 class="index-topic-header" onclick="window.location='/lottie-docs/breakdown/lottie_from_scratch/'">Lottie from Scratch</h3>
            <p>In this example, we'll build a simple lottie animation from scratch.</p>
        </div>
        <div class="index-card-lg" onclick="window.location='/lottie-docs/playground/json_editor/'">
            <h3 class="index-topic-header">Lottie Playground</h3>
            <ul>
                <li><a href="/lottie-docs/playground/json_editor/">JSON Editor</a></li>
                <li><a href="/lottie-docs/playground/builder/">Lottie Builder</a> </li>
            </ul>
        </div>
    </div>
    <div class="index-container-top">
        <div class="index-card-sm"  onclick="window.location='https://docs.lottiefiles.com/lottie-player/components/lottie-player'">
            <img src="/lottie-docs/img/logo-lottie.svg"/>
            <h4 class="index-topic-header">Lottie-Player</h4>
            <p>Easily embed and play Lottie animations in websites.</p>
        </div>
        <div class="index-card-sm" onclick="window.location='https://docs.lottiefiles.com/lottie-player/components/lottie-react'">
            <img src="/lottie-docs/img/logo-react.svg"/>
            <h4 class="index-topic-header">Lottie-React</h4>
            <p>Easily add Lottie animations to your React projects.</p>
        </div>
        <div class="index-card-sm" onclick="window.location='https://docs.lottiefiles.com/lottie-player/components/lottie-svelte'">
            <img src="/lottie-docs/img/logo-svelte.svg"/>
            <h4 class="index-topic-header">Lottie-Svelte</h4>
            <p>Svelte provides a Lottie player using the lottie-web library.</p>
        </div>
        <div class="index-card-sm" onclick="window.location='https://docs.lottiefiles.com/lottie-player/components/lottie-vue'">
            <img src="/lottie-docs/img/vue-logo.svg"/>
            <h4 class="index-topic-header">Lottie-Vue</h4>
            <p>Vue component for the Lottie Web Player.</p>
        </div>
    </div>
    <div class="index-footer">
        <div class="index-footer-content">
            <p>
            LottieFiles is by Design Barn Inc.<br/>
            Copyright © 2022 Design Barn Inc. All rights reserved.
            </p>
        </div>
    </div>
</div>

