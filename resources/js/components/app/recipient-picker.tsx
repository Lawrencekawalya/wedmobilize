import {
    Check,
    ChevronDown,
    Search,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type RecipientContact = {
    id: number;
    name: string | null;
    phone: string;
};

export type RecipientGroup = {
    id: number;
    name: string;
    contacts_count: number;
    contact_ids: number[];
};

export type RecipientSelection = {
    type: 'contact' | 'group';
    id: number;
};

export function RecipientPicker({
    contacts,
    groups,
    value,
    onChange,
}: {
    contacts: RecipientContact[];
    groups: RecipientGroup[];
    value: RecipientSelection[];
    onChange: (value: RecipientSelection[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const container = useRef<HTMLDivElement>(null);
    const query = search.trim().toLowerCase();

    useEffect(() => {
        const close = (event: PointerEvent) => {
            if (!container.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', close);

        return () => document.removeEventListener('pointerdown', close);
    }, []);

    const filteredGroups = useMemo(
        () =>
            groups.filter((group) => group.name.toLowerCase().includes(query)),
        [groups, query],
    );
    const filteredContacts = useMemo(
        () =>
            contacts.filter((contact) =>
                `${contact.name ?? ''} ${contact.phone}`
                    .toLowerCase()
                    .includes(query),
            ),
        [contacts, query],
    );

    const isSelected = (type: RecipientSelection['type'], id: number) =>
        value.some((item) => item.type === type && item.id === id);
    const toggle = (selection: RecipientSelection) => {
        if (isSelected(selection.type, selection.id)) {
            onChange(
                value.filter(
                    (item) =>
                        !(
                            item.type === selection.type &&
                            item.id === selection.id
                        ),
                ),
            );
        } else {
            onChange([...value, selection]);
        }
    };
    const remove = (selection: RecipientSelection) =>
        onChange(
            value.filter(
                (item) =>
                    !(item.type === selection.type && item.id === selection.id),
            ),
        );

    return (
        <div ref={container} className="relative">
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="listbox"
                onClick={() => setOpen((current) => !current)}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-4 py-3 text-left text-sm text-[#466582] transition outline-none hover:border-sky-200 focus:border-[#00bf83] focus:ring-2 focus:ring-emerald-100"
            >
                <span>
                    {value.length > 0
                        ? `${value.length} ${value.length === 1 ? 'selection' : 'selections'}`
                        : 'Search contacts or groups'}
                </span>
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 transition-transform',
                        open && 'rotate-180',
                    )}
                />
            </button>

            {value.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {value.map((selection) => {
                        const label =
                            selection.type === 'group'
                                ? groups.find(
                                      (group) => group.id === selection.id,
                                  )?.name
                                : (() => {
                                      const contact = contacts.find(
                                          (item) => item.id === selection.id,
                                      );

                                      return contact
                                          ? (contact.name ?? contact.phone)
                                          : undefined;
                                  })();

                        if (!label) {
                            return null;
                        }

                        return (
                            <span
                                key={`${selection.type}:${selection.id}`}
                                className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-50 py-1.5 pr-2 pl-3 text-xs font-medium text-[#177b63]"
                            >
                                {selection.type === 'group' ? (
                                    <UsersRound className="size-3.5 shrink-0" />
                                ) : (
                                    <UserRound className="size-3.5 shrink-0" />
                                )}
                                <span className="truncate">{label}</span>
                                <button
                                    type="button"
                                    onClick={() => remove(selection)}
                                    aria-label={`Remove ${label}`}
                                    className="rounded-full p-0.5 hover:bg-emerald-100"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        );
                    })}
                    {value.length > 1 && (
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="px-2 py-1 text-xs font-medium text-[#7187a0] hover:text-[#172a45]"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}

            {open && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-300/40">
                    <div className="border-b border-slate-100 p-3">
                        <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3">
                            <Search className="size-4 shrink-0 text-[#8498ad]" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name or phone"
                                className="h-10 w-full bg-transparent text-sm text-[#172a45] outline-none placeholder:text-[#9baec2]"
                            />
                        </label>
                    </div>
                    <div
                        role="listbox"
                        aria-multiselectable="true"
                        className="max-h-72 overflow-y-auto p-2"
                    >
                        {filteredGroups.length > 0 && (
                            <OptionSection label="Groups">
                                {filteredGroups.map((group) => (
                                    <PickerOption
                                        key={group.id}
                                        selected={isSelected('group', group.id)}
                                        icon={UsersRound}
                                        title={group.name}
                                        detail={`${group.contacts_count} ${group.contacts_count === 1 ? 'contact' : 'contacts'}`}
                                        onClick={() =>
                                            toggle({
                                                type: 'group',
                                                id: group.id,
                                            })
                                        }
                                    />
                                ))}
                            </OptionSection>
                        )}
                        {filteredContacts.length > 0 && (
                            <OptionSection label="Individual contacts">
                                {filteredContacts.map((contact) => (
                                    <PickerOption
                                        key={contact.id}
                                        selected={isSelected(
                                            'contact',
                                            contact.id,
                                        )}
                                        icon={UserRound}
                                        title={
                                            contact.name ?? 'Unnamed contact'
                                        }
                                        detail={contact.phone}
                                        onClick={() =>
                                            toggle({
                                                type: 'contact',
                                                id: contact.id,
                                            })
                                        }
                                    />
                                ))}
                            </OptionSection>
                        )}
                        {filteredGroups.length === 0 &&
                            filteredContacts.length === 0 && (
                                <div className="px-4 py-8 text-center text-sm text-[#7187a0]">
                                    No contacts or groups match “{search}”.
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}

function OptionSection({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-2 last:mb-0">
            <p className="px-3 py-2 text-xs font-semibold tracking-wide text-[#8498ad] uppercase">
                {label}
            </p>
            {children}
        </div>
    );
}

function PickerOption({
    selected,
    icon: Icon,
    title,
    detail,
    onClick,
}: {
    selected: boolean;
    icon: typeof UserRound;
    title: string;
    detail: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            role="option"
            aria-selected={selected}
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                selected ? 'bg-emerald-50' : 'hover:bg-sky-50',
            )}
        >
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    selected
                        ? 'bg-[#00bf83] text-white'
                        : 'bg-sky-50 text-[#466582]',
                )}
            >
                <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[#172a45]">
                    {title}
                </span>
                <span className="block truncate text-xs text-[#7187a0]">
                    {detail}
                </span>
            </span>
            <span
                className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-md border',
                    selected
                        ? 'border-[#00bf83] bg-[#00bf83] text-white'
                        : 'border-slate-200 text-transparent',
                )}
            >
                <Check className="size-3" />
            </span>
        </button>
    );
}
