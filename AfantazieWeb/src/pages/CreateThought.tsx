import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { thoughtColoredTitleDto, fullThoughtDto, thoughtNodeDto } from '../api/dto/ThoughtDto';
import { fetchThoughtTitles, postNewThought, fetchThought, fetchNeighborhoodThoughts } from '../api/graphApiClient';
import { ThoughtReplyLocationState } from '../interfaces/LocationState';
import { Localization } from '../locales/localization';
import { LocalizedCreateThoughtHint } from '../locales/LocalizedCreateThoughtHint';
import { ThoughtViewer } from '../components/ThoughtViewer';

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

interface ThoughtReference {
    id: number;
    title: string;
    refText: string;
    color: string;
}

const SHAPES = [
    { id: 0, svg: '●' },
    { id: 1, svg: '■' },
    { id: 2, svg: '▲' },
    { id: 3, svg: '▼' },
    { id: 4, svg: '◆' },
    { id: 5, svg: '🞭' },
    { id: 6, svg: '❤' }
];


function CreateThought() {
    const REFERENCES_LIMIT = 3;
    const CONTENT_LENGTH_LIMIT = 3000;
    const TITLE_LENGTH_LIMIT = 50;

    const [formData, setFormData] = useState({ title: '', content: '', shape: 0 });
    const navigate = useNavigate();
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);
    const [shakingThoughtIds, setShakingThoughtIds] = useState<number[]>([]);

    const [thoughtTitles, setThoughtTitles] = useState<thoughtColoredTitleDto[]>([]);
    const [filteredThoughtTitles, setFilteredThoughtTitles] = useState<thoughtColoredTitleDto[]>([]);
    const [validThoughtReferences, setValidThoughtReferences] = useState<ThoughtReference[]>([]);
    const [notFoundThoughtIds, setNotFoundThoughtIds] = useState<number[]>([]);
    const [previewOverlayVisible, setPreviewOverlayVisible] = useState(false);
    const [createButtonEnabled, setCreateButtonEnabled] = useState(false);

    const [previewedThought, setPreviewedThought] = useState<fullThoughtDto | null>(null);
    const [previewedThoughtNeighborhood, setPreviewedThoughtNeighborhood] = useState<thoughtNodeDto[]>([]);

    const [tutorialOverlayVisible, setTutorialOverlayVisible] = useState(false);

    const location = useLocation();

    useEffect(() => {
        const fetchAndSetAsync = async () => {
            const response = await fetchThoughtTitles();
            if (response.ok) {
                setThoughtTitles(response.data!);
            }
        };
        fetchAndSetAsync();
    }, []);

    useEffect(() => {
        if (location.state && (location.state as ThoughtReplyLocationState).thoughtId) {
            const id = (location.state as ThoughtReplyLocationState).thoughtId;
            const title = (location.state as ThoughtReplyLocationState).thoughtTitle;
            const conceptTags =
                (location.state as ThoughtReplyLocationState).conceptTags.length > 0
                    ? (location.state as ThoughtReplyLocationState).conceptTags
                        .reduce((prev, current) => `${prev}\n${current}`)
                    : "";
            console.log((location.state as ThoughtReplyLocationState).conceptTags);
            setFormData({ ...formData, content: `${Localization.RepliesTo} [${id}][${title}];${conceptTags.length > 0 ? '\n\n\n' + conceptTags : '\n'}` })
        }
    }, [location, thoughtTitles]);

    const thoughtRegex = (id: number) => new RegExp(`\\[${id}\\]\\[.+?\\]`, '');
    const thoughtRegexGlobal = (id: number) => new RegExp(`\\[${id}\\]\\[.+?\\]`, 'g');
    // todo - Why the hell do I need to define the regex twice?
    const thoughtRegexUniversal = /\[([0-9]+)\]\[(.+?)\]/gm;

    // Handle input changes for the title field
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle input changes for the content field
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputContent = e.target.value;
        // Update form content
        setFormData({ ...formData, content: inputContent });
    };

    const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, shape: Number.parseInt(e.target.value) ?? 0 });
    };

    // Update valid thought references on content change
    useEffect(() => {
        const validThoughts: ThoughtReference[] = [];

        const matches = formData.content.match(thoughtRegexUniversal) || [];

        matches.forEach((match) => {
            const id = parseInt(match.match(/\[([0-9]+)\]/)![1]);
            const searchedThought = thoughtTitles.find(t => t.id === id);
            if (searchedThought && !validThoughts.find(t => t.id === searchedThought.id)) {
                validThoughts.push({
                    id: searchedThought.id,
                    title: searchedThought.title,
                    refText: match.match(/\[([0-9]*)\]\[(.+)\]/)![2],
                    color: searchedThought.color
                });
            }
        });

        setValidThoughtReferences(validThoughts);
    }, [formData]);

    //update not found references on contetn change
    useEffect(() => {
        const notFoundThoughts: number[] = []; // Store invalid thought IDs

        // Find all references in the content
        const matches = formData.content.match(thoughtRegexUniversal) || [];

        matches.forEach((match) => {
            const id = parseInt(match.match(/\[([0-9]+)\]/)![1]);
            const searchedThought = thoughtTitles.find(t => t.id === id);
            if (!searchedThought) {
                notFoundThoughts.push(id);
            }
        });

        setNotFoundThoughtIds(notFoundThoughts);
    }, [formData]);

    // Handle adding new thought reference
    const handleReferenceSelect = (id: number) => {
        setFormData(oldFormData => {
            //new thought is already selected
            if (validThoughtReferences.find(ref => ref.id == id)) {
                setSearchOverlayVisible(false);
                const newForm = { ...formData };
                newForm.content = formData.content.replace(thoughtRegex(id), '');
                return newForm;
            } else {
                // if the limit is reached, shake the thought
                if (validThoughtReferences.length >= REFERENCES_LIMIT) {
                    setShakingThoughtIds([id]);
                    setTimeout(() => setShakingThoughtIds([]), 500);
                    return oldFormData;
                }

                setSearchOverlayVisible(false);

                const textarea = document.getElementById('text-area-editor') as HTMLTextAreaElement;

                const title = thoughtTitles.find((thought) => thought.id === id)?.title;
                if (!title)
                    return oldFormData; // If title is not found, exit early

                const newText = `[${id}][${title}]`;

                // Get the current cursor position
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                // Get the current content of the textarea
                const currentContent = textarea.value;

                // Create the new content by inserting the newText at the cursor position
                const newContent = currentContent.slice(0, start) + newText + currentContent.slice(end);


                // Move the cursor to the end of the inserted text
                textarea.selectionStart = start + newText.length;

                // Optionally, you may want to focus the textarea again
                textarea.focus();

                // Update the textarea value
                return { ...oldFormData, content: newContent };
            }
        });
    }

    function handleReferenceDelete(id: number): void {
        setFormData(oldFormData => {
            const newForm = { ...oldFormData };
            newForm.content = oldFormData.content.replace(thoughtRegexGlobal(id), '');
            return newForm;
        });
    }

    //Update Create button enabled based on conditions
    useEffect(() => {
        const referencesValid = validThoughtReferences.length <= REFERENCES_LIMIT;
        const contentValid = formData.content.length <= CONTENT_LENGTH_LIMIT;
        const titleValid = formData.title.length <= TITLE_LENGTH_LIMIT;
        const notFoundValid = notFoundThoughtIds.length === 0;
        setCreateButtonEnabled(referencesValid && contentValid && titleValid && notFoundValid);
    }, [formData, validThoughtReferences, notFoundThoughtIds,]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCreateButtonEnabled(false);
        const response = await postNewThought({ title: formData.title, content: formData.content, shape: formData.shape });

        if (response.error) {
            setCreateButtonEnabled(true);
            setValidationMessage(response.error);
        } else {
            navigate('/graph/' + response.data);
        }
    };

    // Reset search bar when search overlay is closed or thoughtTitles loaded
    useEffect(() => {
        onSearchBarChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }, [thoughtTitles, searchOverlayVisible]);

    function onSearchBarChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const search = event.target.value;
        if (search === '') {
            setFilteredThoughtTitles(
                thoughtTitles.filter(thought => validThoughtReferences.filter(t => t.id === thought.id).length === 0));
            return;
        }

        setFilteredThoughtTitles(
            thoughtTitles.filter((thought) =>
                thought.title.toLowerCase().includes(search.toLowerCase()) && validThoughtReferences.filter(t => t.id === thought.id).length === 0));
    }

    function handlePreviewClick(id: number): void {
        setPreviewOverlayVisible(true);
        const fetchAndSetAsync = async () => {
            const thoughtResponse = await fetchThought(id);
            if (thoughtResponse.ok) {
                setPreviewedThought(thoughtResponse.data!);
            }

            const neighborhoodResponse = await fetchNeighborhoodThoughts(id, 1, 10);
            //5 instead of 10 should be theoretically enought, but, just to be sure ^^^
            if (neighborhoodResponse.ok) {
                setPreviewedThoughtNeighborhood(neighborhoodResponse.data![1]); //take the first layer only
            }

        };
        fetchAndSetAsync();
    }

    return (
        <div className="content-container">
            {searchOverlayVisible && <div className="search-overlay">
                <input className='search-bar' type="search-bar" placeholder="Hledat" onChange={onSearchBarChange} />
                <div className="search-overlay-content">
                    <div className="search-results">
                        {filteredThoughtTitles.map((thought) => (
                            <button
                                className={`search-result-item 
                                ${shakingThoughtIds.includes(thought.id)
                                        ? 'shake' : ''}`}
                                style={{ borderColor: thought.color }}
                                key={thought.id}
                                onClick={() => handleReferenceSelect(thought.id)}>{thought.title}
                            </button>
                        ))}
                    </div>
                </div>
                <button className='button-secondary' onClick={() => setSearchOverlayVisible(false)}>{Localization.Close}</button>
            </div>}

            {previewOverlayVisible && previewedThought &&
                // <div className='referenced-thought-overlay'>
                //     <div className='text-scroll-container'>
                //         <div className='text-flex-container'>
                //             <h2>{previewedThought.title}</h2>
                //             <h3>{previewedThought.author} - {previewedThought.dateCreated}</h3>
                //             <p className='thought-content'>{previewedThought.content}</p>
                //             {/* //todo: single previewer to use in graph page and here (and elsewhere?)*/}
                //         </div>
                //     </div>
                //     <button className='button-secondary' onClick={() => setPreviewOverlayVisible(false)}>{Localization.Close}</button>
                // </div>
                <div className='referenced-thought-overlay'>
                    <div className='text-scroll-container'>
                        <ThoughtViewer
                            thought={previewedThought}
                            previewMode={true}
                            clickedOnDate={() => { }}
                            closePreview={() => { setPreviewOverlayVisible(false); }}
                            clickedOnUser={() => { }}
                            links={previewedThoughtNeighborhood.filter(t => t.backlinks.includes(previewedThought.id))}
                            backlinks={previewedThoughtNeighborhood.filter(t => t.links.includes(previewedThought.id))}
                            setHighlightedThoughtId={() => { }}
                        ></ThoughtViewer>
                    </div>
                </div>
            }
            {tutorialOverlayVisible && <div className='tutorial-overlay'>
                <div className='scroll-view'>
                    <LocalizedCreateThoughtHint />
                    <button className='button-secondary' onClick={() => setTutorialOverlayVisible(false)}>{Localization.Close}</button>
                </div>
            </div>}
            <div className='new-thought-form'>
                <div className='header-and-hint'>
                    <h1>{Localization.NewThought}</h1>
                    <button className='button-secondary tutorial-button' type="button" onClick={() => setTutorialOverlayVisible(true)}>{Localization.Hint}</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <div className='title-and-shape'>
                            <input
                                className='title-input'
                                placeholder={Localization.NewThoughtTitle}
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleTitleChange}
                            />
                            <select className='shape-select' value={formData.shape} onChange={handleShapeChange}>
                                {SHAPES.map(shape => (
                                    <option key={shape.id} value={shape.id}>{shape.svg}</option>
                                ))}
                            </select>
                        </div>
                        <p className='character-limit character-limit-title'>{formData.title.length} / {TITLE_LENGTH_LIMIT}</p>
                    </div>
                    <textarea
                        id="text-area-editor"
                        placeholder={Localization.Content}
                        name="content"
                        className='content-input'
                        value={formData.content}
                        onChange={handleContentChange}
                    />
                    <p className='bottom-row-buttons'>
                        <span className='character-limit'>{formData.content.length} / {CONTENT_LENGTH_LIMIT}</span>
                        <button className='button-secondary' type="button"
                            onClick={() => setSearchOverlayVisible(true)}>{Localization.AddReference}</button>
                    </p>
                    {notFoundThoughtIds.map((id) => (
                        <p key={id} className='red-text'>{Localization.ThoughtId} <b>{id}</b> {Localization.NotFound}</p>
                    ))}
                    {validThoughtReferences.map((ref) => (
                        <p key={ref.id} className='thought-reference-row'>
                            <button
                                type="button"
                                className='ref-row-button'
                                onClick={() => handleReferenceDelete(ref.id)}>
                                <img className='delete-svg' src={PUBLIC_FOLDER + '/icons/delete.svg'}></img>
                            </button>

                            <span className='referenced-thought' style={{ borderColor: ref.color }}>
                                {ref.refText == ref.title ? ref.title : `${ref.refText} (${ref.title})`}
                            </span>

                            <button
                                type="button"
                                className='ref-row-button'
                                onClick={() => handlePreviewClick(ref.id)}>
                                <img className='eye-svg' src={PUBLIC_FOLDER + '/icons/eye.svg'}></img>
                            </button>

                        </p>
                    ))}
                    {validationMessage && <pre className='red-text'>{validationMessage}</pre>}

                    <p className='bottom-row-buttons'>
                        <button type="button" className='button-secondary' onClick={() => navigate('/graph')}>{Localization.BackButton}</button>
                        <span className={`references-num ${validThoughtReferences.length > REFERENCES_LIMIT ? 'references-num-over-limit' : ''}`}>
                            {validThoughtReferences.length} / {REFERENCES_LIMIT}
                            {validThoughtReferences.length > REFERENCES_LIMIT && ' !!!'}
                        </span>
                        <button
                            type="submit"
                            className={`button-primary ${createButtonEnabled ? '' : 'button-primary-disabled'}`}
                            disabled={!createButtonEnabled}>{Localization.CreateButton}</button>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default CreateThought;